const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");
const Order = require('../models/order');
const {isAdminUser} = require("../helpers/functions")

const all = async (req, res) => {
    try {
        const user = req?.user;
        const isAdmin = isAdminUser(user);
        const { _id: userId } = user || {};
        const {
            _id: orderId,
            customOrderId,
            status,
            accountType,
            paymentMethod,
        } = req.query;

        const page = parseInt(req?.query?.page, 10) || 1;
        const limit = parseInt(req?.query?.limit, 10) || CONFIG.PAGE_LIMIT;
        const skip = (page - 1) * limit;

        const query = {};
        if (!isAdmin) query.userId = userId;

        if (orderId) query._id = orderId;
        if (customOrderId) query.customOrderId = customOrderId;
        if (status) query.status = { $in: status.split(",") };
        if (accountType) query.accountType = accountType;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const total = await Order.countDocuments(query);

        const data = await Order.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("userId")
            .populate("planId");

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
        const { id } = req.params;
        const order = await Order.findById(id).populate("userId");
        if (!order) {
            return json(res, statusCode.NOT_FOUND, "Order not found.");
        }

        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, order);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Order.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Order not found.");
        }

        json(res, statusCode.OK, "Order updated successfully", updated);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Order.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Order not found.");
        }

        json(res, statusCode.OK, "Order deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.OrderController = {
    all,
    byId,
    update,
    destroy,
};
