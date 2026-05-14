const mongoose = require('mongoose');
const {ROLES, TYPES, ACCOUNT_TYPES} = require("../constants/roles");
const {BANK_ACCOUNT_TYPES} = require("../constants/nowpayment");

const user = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    age: {type: Number, required: true, trim: true},
    gender: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true, trim: true},
    phone: {type: String, required: true, trim: true},
    address: {type: String, required: true, trim: true},
    picture: {
        type: String,
        required: false,
        trim: true,
        default: "https://res.cloudinary.com/dyhw94ngc/image/upload/v1752352074/21104_adut1e.png"
    },
    role: {
        type: Number,
        required: true,
        enum: [ROLES.ADMIN, ROLES.USER],
        default: ROLES.USER,
    },
    type: {
        type: String,
        required: true,
        enum: [TYPES.ADMIN, TYPES.USER],
        default: TYPES.USER,
    },
    isVerified: {type: Boolean, required: false, default: false},
    verifyCode: {type: String, required: false, default: null},
    accountType: {
        type: String,
        enum: [ACCOUNT_TYPES.STANDARD, ACCOUNT_TYPES.PROFESSIONAL],
        default: ACCOUNT_TYPES.STANDARD
    },
    walletS: {type: Number, required: false, default: 0},
    walletP: {type: Number, required: false, default: 0},
    activePlanOrderId: {type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false},
    planStatus: {type: Boolean, ref: "Plan", required: false},
    payOutCrypto: {
        token: {type: String, required: false, default: null},
        memoTag: {type: String, required: false, default: null},
        address: {type: String, required: false, default: null},
    },
    payOutBank: {
        beneficiaryName: {type: String, required: false, default: null},
        bankName: {type: String, required: false, default: null},
        accountNumber: {type: String, required: false, default: null},
        iban: {type: String, required: false, default: null},
        accountType: {
            type: String,
            required: false,
            default: null,
            enum: Object.values(BANK_ACCOUNT_TYPES),
        },
        swiftCode: {type: String, required: false, default: null},
        routingNumber: {type: String, required: false, default: null},
    },
}, {timestamps: true});

const User = mongoose.model("User", user);
module.exports = User