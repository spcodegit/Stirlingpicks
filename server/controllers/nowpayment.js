const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const axios = require("axios");
const {CONFIG} = require("../config/config");
const {nanoid} = require("nanoid");
const Order = require('../models/order');
const User = require('../models/users');
const Plan = require('../models/plan');
const {ORDER_STATUS} = require("../constants/order");
const {ACCOUNT_TYPES} = require("../constants/roles");
const {sendOrderPaymentStatusEmail} = require("../helpers/emails/emails");
const {addPlanLog} = require("../helpers/planLogs");

const selectedCurrencies = async (req, res) => {
    try {
        const data = await axios.get(`${CONFIG.NOW_PAYMENT_URL}/merchant/coins`, {
            headers: {
                'x-api-key': CONFIG.NOW_PAYMENT_SECRET_KEY
            }
        })

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data?.data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const createPayment = async (req, res) => {
    try {

        // get data from user
        const {amount, currency, paymentMethod, accountType, planId = null} = req.body;

        // create order id
        const orderId = nanoid();

        // create payload
        const payload = {
            "price_amount": amount,
            "price_currency": "usd",
            "pay_currency": currency?.toLowerCase(),
            "ipn_callback_url": CONFIG.NOW_PAYMENT_IPN_WEBHOOK_URL,
            "order_id": orderId,
            "order_description": `Payment for ${accountType} account against order: ${orderId}`,
            "customer_email": req.user?.email,
            "is_fixed_rate": true,
            "is_fee_paid_by_user": true
        }

        // hit nowpayment api
        const data = await axios.post(`${CONFIG.NOW_PAYMENT_URL}/payment`, payload, {
            headers: {
                'x-api-key': CONFIG.NOW_PAYMENT_SECRET_KEY
            }
        })

        const planInfo = planId? await Plan.findById(planId) : null

        // create order
        const order = new Order({
            userId: req?.user?._id,
            amount: amount,
            feedback: "Order processing",
            paymentInfo: data?.data,
            paymentMethod: paymentMethod,
            accountType: accountType,
            customOrderId: orderId,
            planId: planId,
            planInfo: planInfo
        })
        await order.save();

        return json(res, statusCode.OK, "Order created", order);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const webhook = async (req, res) => {
    try {
        const {actually_paid, order_id, pay_amount, payment_status, price_amount, customWebhookCall = false} = req?.body;
        // console.log("body value is ",req?.body)
        // console.log("------- customWebhookCall value is ", customWebhookCall)
        // console.log("------- payment_status value is ", payment_status)

        if (payment_status && order_id && actually_paid && pay_amount && price_amount) {

            const order = await Order.findOne({customOrderId: order_id})

            if (!order) return json(res, statusCode.BAD_REQUEST, "Order not found.");

            const orderId = order?.paymentInfo?.payment_id

            let orderStatusRes = null
            if (customWebhookCall !== true) {
                orderStatusRes = await axios.get(`${CONFIG.NOW_PAYMENT_URL}/payment/${orderId}`, {
                    headers: {
                        'x-api-key': CONFIG.NOW_PAYMENT_SECRET_KEY
                    }
                })
            }

            const orderStatus = (customWebhookCall === true)?payment_status:orderStatusRes?.data?.payment_status

            // console.log("------- customWebhookCall value is ", customWebhookCall)
            // console.log("------- payment_status value is ", orderStatus)

            if (orderStatus === ORDER_STATUS.WAITING) {
                order.status = orderStatus;
                await order.save()
            }
            if (orderStatus === ORDER_STATUS.CONFIRMING) {
                order.status = orderStatus;
                await order.save();
            }
            if (orderStatus === ORDER_STATUS.CONFIRMED) {
                order.status = orderStatus;
                await order.save()
            }
            if (orderStatus === ORDER_STATUS.PARTTIALLY_PAID) {
                // re-check multiple webhook calls
                if (order.status === ORDER_STATUS.PARTTIALLY_PAID) {
                    return json(res, statusCode.OK, "Order already processed.");
                }

                order.status = orderStatus;
                order.feedback = `Order partially paid. Actual paid is ${actually_paid} and expected was ${pay_amount}, pay more ${pay_amount - actually_paid} to complete the order.`;
                await order.save()
            }
            if (orderStatus === ORDER_STATUS.FINSIHED) {
                // re-check multiple webhook calls
                if (order.status === ORDER_STATUS.FINSIHED) {
                    return json(res, statusCode.OK, "Order already processed.");
                }

                // update user wallet
                const user = await User.findOne({_id: order?.userId})

                if (user) {
                    if (order?.accountType === ACCOUNT_TYPES.STANDARD) {
                        // update standard wallet
                        user.walletS = parseInt(user.walletS) + parseInt(price_amount)
                        await user.save()
                    }
                    else {
                        // update professional wallet
                        // add amount to walletP
                        // user.walletP = parseInt(user.walletP) + parseInt(order?.planInfo?.amount)
                        // just add amount to walletP
                        user.walletP = parseInt(order?.planInfo?.amount)
                        user.activePlanOrderId = order?._id
                        user.planStatus= true
                        await user.save()

                        // log plan purchase using the snapshot stored on the order
                        const planInfo = order?.planInfo || null;
                        const bettingDays = Number(planInfo?.bettingDays ?? 30);
                        const expiresAt = new Date(new Date(order.createdAt).getTime() + bettingDays * 24 * 60 * 60 * 1000);
                        await addPlanLog({
                            userId: user._id,
                            orderId: order._id,
                            type: "plan_purchased",
                            message: `Professional plan purchased. Credited walletP ${planInfo?.amount ?? 0}. Valid for ${bettingDays} days.`,
                            meta: {
                                planId: order?.planId ?? null,
                                planInfo,
                                creditedAmount: planInfo?.amount ?? 0,
                                paidAmount: price_amount ?? order?.amount,
                                startsAt: order.createdAt,
                                expiresAt,
                                restrictions: {
                                    minBettingDays: planInfo?.minBettingDays ?? null,
                                    drawDown: planInfo?.drawDown ?? null,
                                    dailyDrawDownMax: planInfo?.dailyDrawDownMax ?? null,
                                },
                            },
                        });
                    }

                    // send email to user
                    if (user?.email) {
                        sendOrderPaymentStatusEmail(user.email, {
                            name: user?.name,
                            orderId: order?.customOrderId,
                            status: orderStatus,
                            amount: price_amount ?? order?.amount,
                            accountType: order?.accountType,
                            adminContext: {
                                userId: user._id,
                                userEmail: user.email,
                                userName: user.name,
                            },
                        });
                    }
                }

                // update order status to paid
                order.status = orderStatus;
                await order.save()
            }
            if (orderStatus === ORDER_STATUS.REFUNDED) {
                order.status = orderStatus;
                await order.save()
            }
            if (orderStatus === ORDER_STATUS.EXPIRED) {
                // console.log("order status is expired func call")
                order.status = orderStatus;
                await order.save()
            }
        }

        return json(res, statusCode.OK, "Webhook called successfully.");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const paymentStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await axios.get(`${CONFIG.NOW_PAYMENT_URL}/payment/${id}`, {
            headers: {
                'x-api-key': CONFIG.NOW_PAYMENT_SECRET_KEY
            }
        })

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data?.data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const allCurrencies = async (req, res) => {
    try {
        const data = await axios.get(`${CONFIG.NOW_PAYMENT_URL}/currencies`, {
            headers: {
                'x-api-key': CONFIG.NOW_PAYMENT_SECRET_KEY
            }
        })

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data?.data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.NowPaymentController = {
    selectedCurrencies,
    createPayment,
    webhook,
    paymentStatus,
    allCurrencies
};
