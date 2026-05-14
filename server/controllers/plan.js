const json = require('../helpers/json_response');
const statusCode = require("http-status-codes");
const { RESPONSE_MESSAGES } = require("../constants/response_message");
const Plan = require("../models/plan");

// CREATE PLAN
const create = async (req, res) => {
    try {
        const data = new Plan(req.body);
        await data.save();

        json(res, statusCode.OK, "Plan created successfully", data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

// GET ALL PLANS
const all = async (req, res) => {
    try {
        const data = await Plan.find();
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

// GET PLAN BY ID
const byId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Plan.findById(id);

        if (!data) {
            return json(res, statusCode.NOT_FOUND, "Plan not found.");
        }

        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

// UPDATE PLAN
const update = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Plan.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Plan not found.");
        }

        json(res, statusCode.OK, "Plan updated successfully", updated);
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

// DELETE PLAN
const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Plan.findByIdAndDelete(id);

        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Plan not found.");
        }

        json(res, statusCode.OK, "Plan deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.PlanController = {
    create,
    all,
    byId,
    update,
    destroy,
};