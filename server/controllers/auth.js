const User = require('../models/users');
const Support = require('../models/support');
const Payout = require('../models/payout');
const Order = require('../models/order');
const Bet = require('../models/bet');
const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {generateJwtToken} = require("../helpers/jwt");
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {encryptPassword, compareEncryptedPassword, generateUserVerificationCode} = require("../helpers/functions");
const {nanoid} = require("nanoid");
const {sendUserVerificationEmail, sendForgotPasswordEmail} = require("../helpers/emails/emails")
const {ACCOUNT_TYPES} = require("../constants/roles");
const {CONFIG} = require("../config/config");
const {formatCounts} = require("../helpers/functions");

const WALLET_S_PROMO_CODES = {
    "X9vK2mQ7LpA4": 10,
    "R8tY4nW2ZqM7": 20,
    "B5xJ9cV3HuT1": 30,
    "N7pL4sD8KaQ2": 40,
    "F2mZ8wR5TyU9": 50,
    "Q4hX7nC1VpK6": 60,
    "U9kB3mL7RsD4": 70,
    "T6vQ1xP8ZnH5": 80,
    "M3rY9kW4LcF7": 90,
    "P8nD2tX5QaV1": 100,
};

const login = async (req, res) => {
    try {
        // get user email and password from request
        const { email, password } = req.body;
        // fetch user
        let user = await User.findOne({ email: email });
        if (!user) return json(res, statusCode.BAD_REQUEST, "User not exist, please signup/register before signing in.");

        // check if password match
        const checkPassword = compareEncryptedPassword(password, user?.password)
        if (!checkPassword) return json(res, statusCode.BAD_REQUEST, "Invalid password.");

        // check verification
        if (!user?.isVerified) return json(res, statusCode.BAD_REQUEST, "Please verify your email address.");

        // generate jwt token
        const token = generateJwtToken(user)
        json(res, statusCode.OK, "Login successfully", { user, token });
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, walletS: walletSPromoCode } = req.body;
        // check if user exist
        let user = await User.findOne({ email: email });
        if (user) return json(res, statusCode.BAD_REQUEST, "Email already registered.")

        // create user
        // generate verification code
        const verificationCode = generateUserVerificationCode()
        const amountFromPromoCode = walletSPromoCode ? WALLET_S_PROMO_CODES[walletSPromoCode] : null;
        const { walletS: _ignoredWalletS, ...safeBody } = req.body;
        const data = new User(safeBody);
        data.password = encryptPassword(password)
        data.verifyCode = verificationCode
        if (amountFromPromoCode) {
            data.walletS = amountFromPromoCode;
        }
        await data.save();

        // send verification email
        sendUserVerificationEmail(data?.email, verificationCode)

        // generate jwt token
        const token = generateJwtToken(data)

        json(res, statusCode.OK, "Registered successfully", { user: data, token });
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const verify = async (req, res) => {
    try {
        const { code } = req.query

        // find user by verification code
        const user = await User.findOne({ verifyCode: code })
        if (!user) return json(res, statusCode.BAD_REQUEST, "Invalid verification code.")

        await User.findByIdAndUpdate(
            user?._id,
            {
                isVerified: true,
                verifyCode: null
            },
        );

        json(res, statusCode.OK, "Email verified successfully.");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        // find user by verification code
        const user = await User.findOne({ email: email })
        if (!user) return json(res, statusCode.BAD_REQUEST, "User not registered with this email address.")

        const newPassword = nanoid()
        user.password = encryptPassword(newPassword)
        user.save()

        sendForgotPasswordEmail(user?.email, newPassword)

        json(res, statusCode.OK, "Email send, please check inbox.");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const me = async (req, res) => {
    try {
        // get email form request
        const { email } = req.user;
        // find user
        let user = await User.findOne({ email })
            .select("-password")
            .populate("activePlanOrderId")
        // if not user found return error
        if (!user) return json(res, statusCode.NOT_FOUND, "User not exist!");
        // send data if user found
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, { user, token: req.token });
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "User not found.");
        }
        json(res, statusCode.OK, "User updated successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const allUsers = async (req, res) => {
    try {
        const {id, status, email, phone, age, gender} = req.query;

        // pagination
        const page = parseInt(req?.query?.page, 10) || 1;
        const limit = parseInt(req?.query?.limit, 10) || CONFIG.PAGE_LIMIT;
        const skip = (page - 1) * limit;

        // base query
        const query = {type: 'user', role: 1,};

        // filters
        if (id) query._id = id;
        if (status !== undefined) query.isVerified = status === 'true';
        if (email) query.email = { $regex: email, $options: "i" }; // case-insensitive search
        if (phone) query.phone = { $regex: phone, $options: "i" };
        if (age) query.age = age;
        if (gender) query.gender = gender;

        // total count
        const total = await User.countDocuments(query);

        // data fetch
        const users = await User.find(query)
            .select('-password -verifyCode')
            .skip(skip)
            .limit(limit)
            .populate("activePlanOrderId")
            .sort({ createdAt: -1 });

        // response
        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "User not found.");
        }
        json(res, statusCode.OK, "User deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // find user
        let user = await User.findOne({ _id: req?.user?._id });
        // if not user found return error
        if (!user) return json(res, statusCode.NOT_FOUND, "User not exist!");

        const checkPassword = compareEncryptedPassword(oldPassword, user?.password)
        if (!checkPassword) return json(res, statusCode.BAD_REQUEST, "Invalid old password.");

        const updated = await User.findByIdAndUpdate(
            req?.user?._id,
            {
                password: encryptPassword(newPassword)
            },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Password not changed.");
        }
        json(res, statusCode.OK, "Password changed successfully.");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const updateAccountType = async (req, res) => {
    try {
        const data = await User.findOne({_id: req?.user?._id})
        if (!data) {
            return json(res, statusCode.NOT_FOUND, "User not found.");
        }
        if (data?.accountType === ACCOUNT_TYPES.STANDARD) {
            data.accountType = ACCOUNT_TYPES.PROFESSIONAL
        }
        else {
            data.accountType = ACCOUNT_TYPES.STANDARD
        }

        await data.save()

        json(res, statusCode.OK, "User account status changed successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const adminCounters = async (req, res) => {
    try {
        const [
            users,
            tickets,
            payouts,
            orders,
            bets,
            orderStats,
            betStats
        ] = await Promise.all([

            // 👤 USERS
            User.aggregate([
                { $match: { type: 'user', role: 1 } },
                { $group: { _id: null, total: { $sum: 1 } } }
            ]),

            // 🎫 SUPPORT (ALL STATUSES)
            Support.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 💸 PAYOUTS (ALL STATUSES)
            Payout.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 📦 ORDERS (ALL STATUSES)
            Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 🎲 BETS (ALL STATUSES)
            Bet.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 💰 TOTAL DEPOSIT (ONLY SUCCESSFUL ORDERS)
            Order.aggregate([
                {
                    $match: {
                        status: { $in: ['finished', 'confirmed'] } // adjust if needed
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDeposit: { $sum: '$amount' }
                    }
                }
            ]),

            // 💰 BET STATS (ONLY COMPLETED BETS)
            Bet.aggregate([
                {
                    $match: {
                        status: { $in: ['win', 'loss'] },
                        pnl: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalBetAmount: { $sum: '$price' },
                        totalPnl: { $sum: '$pnl' }
                    }
                }
            ])
        ]);

        // 🔧 FORMAT FUNCTION
        const formatCounts = (arr = [], statuses = []) => {
            const obj = {};

            // initialize all statuses to 0
            statuses.forEach(s => obj[s] = 0);

            // fill actual values
            arr.forEach(item => {
                obj[item._id] = item.count;
            });

            // total
            obj.total = Object.values(obj).reduce((a, b) => a + b, 0);

            return obj;
        };

        // 🧠 DEFINE ALL POSSIBLE STATUSES (IMPORTANT)
        const ORDER_STATUSES = [
            'pending',
            'waiting',
            'confirming',
            'confirmed',
            'sending',
            'partially_paid',
            'finished',
            'failed',
            'refunded',
            'expired'
        ];

        const PAYOUT_STATUSES = [
            'placed',
            'pending',
            'approved',
            'completed',
            'rejected'
        ];

        const BET_STATUSES = [
            'placed',
            'finalizing',
            'win',
            'loss'
        ];

        const SUPPORT_STATUSES = [
            'placed',
            'pending',
            'resolved',
            'closed'
        ];

        // 💰 SAFE EXTRACTION
        const totalDeposit = orderStats?.[0]?.totalDeposit || 0;
        const totalBetAmount = betStats?.[0]?.totalBetAmount || 0;
        const totalPnl = betStats?.[0]?.totalPnl || 0;

        // 💰 COMPANY PROFIT
        const companyProfit = totalBetAmount - totalPnl;

        const data = {
            users: {
                total: users?.[0]?.total || 0
            },

            tickets: formatCounts(tickets, SUPPORT_STATUSES),

            payouts: formatCounts(payouts, PAYOUT_STATUSES),

            orders: formatCounts(orders, ORDER_STATUSES),

            bets: formatCounts(bets, BET_STATUSES),

            // 🔥 FINANCE BLOCK
            finance: {
                totalDeposit,
                totalBetAmount,
                totalPnl,
                companyProfit
            }
        };

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, data);

    } catch (error) {
        return json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

module.exports.AuthController = {
    login,
    register,
    verify,
    forgotPassword,
    me,
    update,
    allUsers,
    destroy,
    changePassword,
    updateAccountType,
    adminCounters,
};
