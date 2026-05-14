const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");
const Support = require("../models/support");
const {SUPPORT_STATUS} = require("../constants/support");
const {ACCOUNT_TYPES} = require("../constants/roles");
const {isAdminUser} = require("../helpers/functions")
const User = require("../models/users");
const { sendSupportRequestEmail } = require("../helpers/emails/emails");

const create = async (req, res) => {
    try {
        const userId = req?.user?._id;

        // Count active (PLACED + PENDING) requests
        const activeRequestsCount = await Support.countDocuments({userId, status: { $in: [SUPPORT_STATUS.PLACED, SUPPORT_STATUS.PENDING] }});

        // Restrict if >= 3
        if (activeRequestsCount >= 3) return json(res, statusCode.BAD_REQUEST, "You can only have up to 3 pending or placed payout requests at a time.")

        // Create new payout request
        const data = new Support(req?.body);
        data.userId = userId;
        await data.save();

        const user = await User.findById(userId);
        if (user?.email) {
            const messagePreview = String(data.message || "").slice(0, 280);
            sendSupportRequestEmail(user.email, {
                name: user.name,
                supportId: data._id,
                messagePreview,
                status: data.status,
                event: "created",
                adminContext: {
                    userId: user._id,
                    userEmail: user.email,
                    userName: user.name,
                },
            });
        }

        json(res, statusCode.OK, "Support request saved successfully");

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

        const { id } = req.query;

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

        // Only _id filter
        if (id) {
            query._id = id;
        }

        // Total count
        const total = await Support.countDocuments(query);

        // Data fetch
        const data = await Support.find(query)
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
        const data = await Support.findById(id)
        if (!data) {
            return json(res, statusCode.NOT_FOUND, "Support not found.");
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

        const support = await Support.findOne({_id: id})

        if (support?.status === status) return json(res, statusCode.BAD_REQUEST, "Support status is already "+status+".");

        const previousStatus = support?.status;
        const statusChanging =
            Object.prototype.hasOwnProperty.call(req.body, "status") &&
            previousStatus !== status;

        const updated = await Support.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Support not found.");
        }

        if (statusChanging) {
            const user = await User.findById(support.userId);
            if (user?.email) {
                sendSupportRequestEmail(user.email, {
                    name: user.name,
                    supportId: updated._id,
                    status: updated.status,
                    event: "status_changed",
                    previousStatus,
                    adminContext: {
                        userId: user._id,
                        userEmail: user.email,
                        userName: user.name,
                    },
                });
            }
        }

        json(res, statusCode.OK, "Support updated successfully", updated);
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
        const deleted = await Support.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Support not found.");
        }

        json(res, statusCode.OK, "Support deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.SupportController = {
    create,
    all,
    byId,
    update,
    destroy,
};
