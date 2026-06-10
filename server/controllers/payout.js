const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");
const Payout = require("../models/payout");
const User = require("../models/users");
const {PAYOUT_STATUS} = require("../constants/payout");
const {ACCOUNT_TYPES} = require("../constants/roles");
const {isAdminUser} = require("../helpers/functions")
const { sendPayoutRequestEmail } = require("../helpers/emails/emails");
const {
    getActiveProfessionalPlanContext,
    computeProfessionalPlanStats,
} = require("./bet");

const create = async (req, res) => {
    try {

        const {amount, accountType} = req.body

        // const existingRequest = await Payout.findOne({userId: req?.user?._id, status: { $in: [PAYOUT_STATUS.PLACED, PAYOUT_STATUS.PENDING] }})
        // if (existingRequest) return json(res, statusCode.BAD_REQUEST, "User already has a pending or placed payout request.");

        const user = await User.findById(req?.user?._id);

        // detuct from wallet and add payment request
        if (accountType === ACCOUNT_TYPES.STANDARD) {

            if (user.walletS < amount) return json(res, statusCode.BAD_REQUEST, "Insufficient funds.");

            // detuct from walletS
            user.walletS -= amount;
            user.save()
        }
        else {
            const ctx = await getActiveProfessionalPlanContext(user._id);
            if (!ctx?.user?.planStatus || !ctx?.order || !ctx?.startsAt || !ctx?.expiresAt) {
                return json(res, statusCode.BAD_REQUEST, "No active professional plan found.");
            }

            const now = new Date();
            if (now >= ctx.expiresAt) {
                return json(res, statusCode.BAD_REQUEST, "Plan expired. Professional payout is not allowed.");
            }

            const stats = await computeProfessionalPlanStats({
                userId: user._id,
                orderId: ctx.order._id,
                startsAt: ctx.startsAt,
                expiresAt: ctx.expiresAt,
            });
            const minBettingDays = Number(ctx?.planInfo?.minBettingDays ?? 5);

            if (stats.bettingDaysCount < minBettingDays) {
                return json(
                    res,
                    statusCode.BAD_REQUEST,
                    `Payout is not allowed. Minimum betting days not met (${stats.bettingDaysCount}/${minBettingDays}).`
                );
            }

            if (user.walletP < amount) return json(res, statusCode.BAD_REQUEST, "Insufficient funds.");

            // detuct from walletP
            user.walletP -= amount;
            user.save()
        }

        // create payment request
        const data = new Payout(req?.body)
        data.userId = req?.user?._id;
        await data.save();

        if (user?.email) {
            sendPayoutRequestEmail(user.email, {
                name: user.name,
                payoutId: data._id,
                amount: data.amount,
                accountType: data.accountType,
                type: data.type,
                status: data.status,
                event: "created",
                adminContext: {
                    userId: user._id,
                    userEmail: user.email,
                    userName: user.name,
                },
            });
        }

        json(res, statusCode.OK, "Payout request saved successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const all = async (req, res) => {
    try {
        const user = req?.user;
        const isAdmin = isAdminUser(user);
        const { _id: userId } = user;

        const {
            amount,
            accountType,
            type,
            status
        } = req.query;

        // Pagination
        const page = parseInt(req?.query?.page, 10) || 1;
        const limit = parseInt(req?.query?.limit, 10) || CONFIG.PAGE_LIMIT;
        const skip = (page - 1) * limit;

        // Query builder
        const query = {};

        // If NOT admin → only own records
        if (!isAdmin) {
            query.userId = userId;
        }

        // Filters
        if (amount) {
            query.amount = Number(amount); // exact match
            // OR for range later you can extend this
        }

        if (accountType) {
            query.accountType = accountType;
        }

        if (type) {
            query.type = type;
        }

        if (status) {
            query.status = { $in: status.split(",") };
        }

        // Total count
        const total = await Payout.countDocuments(query);

        // Data fetch
        const data = await Payout.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("userId");

        // Response
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const byId = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await Payout.findById(id)
        if (!data) {
            return json(res, statusCode.NOT_FOUND, "Payout not found.");
        }
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        const payout = await Payout.findOne({_id: id})

        if (payout?.status === status) return json(res, statusCode.BAD_REQUEST, "Payout status is already "+status+".");

        const previousStatus = payout?.status;
        const statusChanging =
            Object.prototype.hasOwnProperty.call(req.body, "status") &&
            previousStatus !== status;

        const updated = await Payout.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Payout not found.");
        }

        if (statusChanging) {
            const notifyUser = await User.findById(payout.userId);
            if (notifyUser?.email) {
                sendPayoutRequestEmail(notifyUser.email, {
                    name: notifyUser.name,
                    payoutId: updated._id,
                    amount: updated.amount,
                    accountType: updated.accountType,
                    type: updated.type,
                    status: updated.status,
                    event: "status_changed",
                    previousStatus,
                    adminContext: {
                        userId: notifyUser._id,
                        userEmail: notifyUser.email,
                        userName: notifyUser.name,
                    },
                });
            }
        }

        if (status === PAYOUT_STATUS.REJECTED) {
            const user = await User.findOne({_id: payout?.userId})

            // Update wallet
            if (payout?.accountType === ACCOUNT_TYPES.STANDARD) {
                user.walletS += payout?.amount;
                user.save()
            } else {
                user.walletP += payout?.amount;
                user.save()
            }
        }

        json(res, statusCode.OK, "Payout updated successfully", updated);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const destroy = async (req, res) => {
    try {
        const {id} = req.params;
        const deleted = await Payout.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Payout not found.");
        }

        json(res, statusCode.OK, "Payout deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.PayoutController = {
    create,
    all,
    byId,
    update,
    destroy,
};
