const json = require("../helpers/json_response");
const statusCode = require("http-status-codes");
const { RESPONSE_MESSAGES } = require("../constants/response_message");
const { getPlanLogsForUserOrder } = require("../helpers/planLogs");

const allByUserAndOrder = async (req, res) => {
    try {
        const { userId, orderId } = req?.query || {};

        if (!userId || !orderId) {
            return json(res, statusCode.BAD_REQUEST, "User or Order IDs are required.");
        }

        const data = await getPlanLogsForUserOrder(userId, orderId);

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);
    } catch (error) {
        return json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message,
        });
    }
};

module.exports.PlanLogsController = {
    allByUserAndOrder,
};
