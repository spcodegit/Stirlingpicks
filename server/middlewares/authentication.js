const jwt = require("jsonwebtoken");
const json = require("../helpers/json_response");
const User = require("../models/users");
const statusCode = require('http-status-codes')
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");

exports.isAuthenticated = async (req, res, next) => {
    try {
        // get token from header
        const authHeader = req.headers["authorization"];
        // extract token
        const token = authHeader && authHeader.split(" ")[1];
        // if token not found
        if (!token) return json(res, statusCode.FORBIDDEN, RESPONSE_MESSAGES.FORBIDDEN_REQUEST);
        // decode if token found
        const decode = jwt.verify(token, CONFIG.JWT_SECRET);
        // fetch user from token data
        const isUser = await User.findById(decode?.data?._id).select("-password");
        // return error if user not found
        if (!isUser) return json(res, statusCode.FORBIDDEN, RESPONSE_MESSAGES.FORBIDDEN_REQUEST);
        // add user and token to request
        req.user = isUser;
        req.token = token;
        // proceed further
        next();
    } catch (error) {
        json(res, statusCode.FORBIDDEN, RESPONSE_MESSAGES.FORBIDDEN_REQUEST);
    }
};

exports.isAuthorized = (...roles) => {
    return (req, res, next) => {
        // check if user matches role specified
        if (!roles.includes(req.user.role)) {
            // if not return error
            return json(res, statusCode.UNAUTHORIZED, RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST);
        }
        next();
    };
};
