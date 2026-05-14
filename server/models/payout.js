const mongoose = require("mongoose");
const {ACCOUNT_TYPES} = require("../constants/roles");
const {PAYOUT_METHODS, PAYOUT_STATUS} = require("../constants/payout");

const payout = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        amount: {type: Number, required: true},
        accountType: {type: String, required: true, enum: [ACCOUNT_TYPES.STANDARD, ACCOUNT_TYPES.PROFESSIONAL]},
        type: {type: String, required: true, enum: Object.values(PAYOUT_METHODS)},
        status: {type: String, required: true, enum: Object.values(PAYOUT_STATUS), default: PAYOUT_STATUS.PLACED},
    },
    {timestamps: true},
);

const Payout = mongoose.model("Payout", payout);
module.exports = Payout;