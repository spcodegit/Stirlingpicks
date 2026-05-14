const mongoose = require("mongoose");

const plan = new mongoose.Schema(
    {
        amount: {type: Number, required: true},
        bettingDays: {type: Number, required: true, default: 30},
        minBettingDays: {type: Number, required: true, default: 5},
        dailyDrawDownMax: {type: Number, required: true },
        drawDown: {type: Number, required: true },
        fee: {type: Number, required: true },
    },
    {timestamps: true},
);

const Plan = mongoose.model("Plan", plan);
module.exports = Plan;