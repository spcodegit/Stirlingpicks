const mongoose = require("mongoose");
const {SUPPORT_STATUS} = require("../constants/support");

const support = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        message: {type: String, required: true},
        status: {type: String, required: true, enum: Object.values(SUPPORT_STATUS), default: SUPPORT_STATUS.PLACED},
    },
    {timestamps: true},
);

const Support = mongoose.model("Support", support);
module.exports = Support;