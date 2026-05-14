const mongoose = require("mongoose");
const {PAYMENT_METHODS, ORDER_STATUS} = require("../constants/order");
const {ACCOUNT_TYPES} = require("../constants/roles");

const order = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,},
        customOrderId: {type: String, required: true, unique: true},
        amount: {type: Number, required: true,},
        status: {
            type: String,
            required: true,
            enum: [
                ORDER_STATUS.PENDING,
                ORDER_STATUS.WAITING,
                ORDER_STATUS.CONFIRMING,
                ORDER_STATUS.CONFIRMED,
                ORDER_STATUS.SENDING,
                ORDER_STATUS.PARTTIALLY_PAID,
                ORDER_STATUS.FINSIHED,
                ORDER_STATUS.FAILED,
                ORDER_STATUS.REFUNDED,
                ORDER_STATUS.EXPIRED,
            ],
            default: ORDER_STATUS.PENDING,
        },
        feedback: {type: String, required: false, default: null},
        paymentInfo: {type: Object, required: false, default: null},
        paymentMethod: {
            type: String,
            enum: [PAYMENT_METHODS.CRYPTO, PAYMENT_METHODS.STRIPE],
            required: true,
        },
        accountType: {type: String, required: true, enum: [ACCOUNT_TYPES.STANDARD, ACCOUNT_TYPES.PROFESSIONAL]},
        planId: {type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: false, default: null}, // only for professional account
        planInfo: {type: Object, required: false, default: null},
    },
    {timestamps: true},
);

const Order = mongoose.model("Order", order);
module.exports = Order;