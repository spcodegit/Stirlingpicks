const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");
const {ACCOUNT_TYPES} = require("../constants/roles");
const User = require("../models/users");
const {sendBetPlacedEmail} = require("../helpers/emails/emails");
const Faq = require("../models/faq");

const create = async (req, res) => {
    try {
        const data = new Faq(req?.body)
        await data.save();

        json(res, statusCode.OK, "Faq saved successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const all = async (req, res) => {
    try {
        const data = await Faq.find({status: true})
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);
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
        const data = await Faq.findById(id)
        if (!data) {
            return json(res, statusCode.NOT_FOUND, "Faq not found.");
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
        const updated = await Faq.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Faq not found.");
        }
        json(res, statusCode.OK, "Faq updated successfully", updated);
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
        const deleted = await Faq.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Faq not found.");
        }

        json(res, statusCode.OK, "Faq deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.FaqController = {
    create,
    all,
    byId,
    update,
    destroy,
};
