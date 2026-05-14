const STATUSCODE = require("http-status-codes")
const crypto = require("crypto")
const {CONFIG} = require("../config/config");
const {RESPONSE_MESSAGES} = require("../constants/response_message");


module.exports = (res, statusCode, message, data) => {
    try {
        if (data === null) {
            res.status(STATUSCODE.OK).json({status: statusCode, message});
        } else if (message === null) {
            res.status(STATUSCODE.OK).json({status: statusCode, data: data});
        } else {
            res.status(STATUSCODE.OK).json({status: statusCode, message, data: data});
        }
    } catch (error) {
        console.error('JSON response error:', error);
        res.status(STATUSCODE.INTERNAL_SERVER_ERROR).json({
            status: 500,
            message: {
                user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
                system: error.message
            }
        });
    }
};
