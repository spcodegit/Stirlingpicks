const mongoose = require("mongoose");

const planLogs = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        orderId: {type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true},
        type: {
            type: String,
            required: true,
            enum: [
                "plan_purchased",
                "plan_expired",
                "bet_placed",
                "bet_finalized",
                "eligibility_updated",
            ],
            default: "eligibility_updated",
        },
        message: {type: String, required: true},
        meta: {type: Object, required: false, default: null},
    },
    {timestamps: true},
);

const PlanLogs = mongoose.model("PlanLogs", planLogs);
module.exports = PlanLogs;