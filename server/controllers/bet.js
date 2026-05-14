const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const {CONFIG} = require("../config/config");
const Bet = require('../models/bet');
const {isAdminUser} = require("../helpers/functions")
const {ACCOUNT_TYPES} = require("../constants/roles");
const User = require("../models/users");
const {BET_STATUS} = require("../constants/bet");
const { sendBetPlacedEmail, sendBetResultEmail } = require("../helpers/emails/emails");
const Order = require("../models/order");
const {addPlanLog} = require("../helpers/planLogs");

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayKey(d) {
    const dt = new Date(d);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dt.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function computeNetProfit({ status, pnl, price }) {
    if (status === BET_STATUS.WIN) return (Number(pnl ?? 0) - Number(price ?? 0));
    if (status === BET_STATUS.LOSE) return -Number(price ?? 0);
    return 0;
}

async function getActiveProfessionalPlanContext(userId) {
    const user = await User.findById(userId);
    if (!user?.activePlanOrderId) return { user, order: null, expiresAt: null, startsAt: null, planInfo: null };

    const order = await Order.findById(user.activePlanOrderId);
    if (!order) return { user, order: null, expiresAt: null, startsAt: null, planInfo: null };

    const planInfo = order?.planInfo || null;
    const bettingDays = Number(planInfo?.bettingDays ?? 30);
    const startsAt = new Date(order.createdAt);
    const expiresAt = new Date(startsAt.getTime() + bettingDays * DAY_MS);

    return { user, order, startsAt, expiresAt, planInfo };
}

async function computeProfessionalPlanStats({ userId, orderId, startsAt, expiresAt, finalizedBetOverride = null }) {
    const Bet = require("../models/bet");
    const bets = await Bet.find({
        userId,
        accountType: ACCOUNT_TYPES.PROFESSIONAL,
        createdAt: { $gte: startsAt, $lt: expiresAt },
    }).select("_id createdAt status pnl price");

    const bettingDaysSet = new Set();
    let totalNetProfit = 0;
    let totalLossAmount = 0;

    for (const b of bets) {
        bettingDaysSet.add(toDayKey(b.createdAt));

        let effectiveStatus = b.status;
        let effectivePnl = b.pnl;
        let effectivePrice = b.price;

        if (finalizedBetOverride && String(b._id) === String(finalizedBetOverride.betId)) {
            effectiveStatus = finalizedBetOverride.status;
            effectivePnl = finalizedBetOverride.pnl;
            effectivePrice = finalizedBetOverride.price;
        }

        if ([BET_STATUS.WIN, BET_STATUS.LOSE].includes(effectiveStatus)) {
            totalNetProfit += computeNetProfit({ status: effectiveStatus, pnl: effectivePnl, price: effectivePrice });

            if (effectiveStatus === BET_STATUS.LOSE) {
                const lossAmount = Math.max(Number(effectivePrice ?? 0) - Number(effectivePnl ?? 0), 0);
                totalLossAmount += lossAmount;
            }
        }
    }

    return {
        bettingDaysCount: bettingDaysSet.size,
        totalNetProfit,
        totalLossAmount,
        betsCount: bets.length,
    };
}

async function expireProfessionalPlacedBets({ userId, startsAt, expiresAt }) {
    const result = await Bet.updateMany(
        {
            userId,
            accountType: ACCOUNT_TYPES.PROFESSIONAL,
            status: BET_STATUS.PLACED,
            createdAt: { $gte: startsAt, $lt: expiresAt },
        },
        {
            $set: {
                status: BET_STATUS.EXPIRE,
                pnl: 0,
            },
        }
    );

    return Number(result?.modifiedCount || 0);
}


const create = async (req, res) => {
    try {
        const {_id: userId, accountType, walletS} = req?.user
        const {sport ,bet ,placedBet ,price} = req?.body

        // check standard account
        if (accountType === ACCOUNT_TYPES.STANDARD) {
            // check available balance
            if (price > walletS ) return json(res, statusCode.BAD_REQUEST, "Insufficient balance");

            // deduct the funds
            let user = await User.findOne({ _id: req?.user?._id })
            user.walletS = (user.walletS - price)
            await user.save()

            // send mail
            if (user?.email) {
                sendBetPlacedEmail(user?.email, {
                    name: user.name,
                    sport: sport?.name+" ["+sport?.league+"]" ,
                    bet: placedBet?.value,
                    placedBet,
                    price,
                    adminContext: {
                        userId: user._id,
                        userEmail: user.email,
                        userName: user.name,
                    },
                });
            }
        } // check professional account
        else {
            const ctx = await getActiveProfessionalPlanContext(userId);

            if (!ctx?.user) return json(res, statusCode.NOT_FOUND, "User not found");

            // must have an active plan
            if (!ctx?.user?.planStatus || !ctx?.order) {
                return json(res, statusCode.BAD_REQUEST, "No active professional plan found.");
            }

            // block betting after expiry
            const now = new Date();
            if (ctx.expiresAt && now >= ctx.expiresAt) {
                const expiredBetsCount = await expireProfessionalPlacedBets({
                    userId: ctx.user._id,
                    startsAt: ctx.startsAt,
                    expiresAt: ctx.expiresAt,
                });

                ctx.user.planStatus = null;
                ctx.user.activePlanOrderId = null;
                ctx.user.walletP = 0;
                await ctx.user.save();

                await addPlanLog({
                    userId: ctx.user._id,
                    orderId: ctx.order._id,
                    type: "plan_expired",
                    message: "Professional plan expired. Plan was closed and professional wallet reset.",
                    meta: {
                        reason: "duration_completed",
                        expiredBetsCount,
                        startsAt: ctx.startsAt,
                        expiresAt: ctx.expiresAt,
                    },
                });

                return json(res, statusCode.BAD_REQUEST, "Plan expired. Please purchase a new plan.");
            }

            // check available balance in professional wallet
            if (price > ctx.user.walletP) return json(res, statusCode.BAD_REQUEST, "Insufficient balance");

            // deduct the funds from professional wallet
            ctx.user.walletP = (ctx.user.walletP - price);
            await ctx.user.save();

            // send mail
            if (ctx.user?.email) {
                sendBetPlacedEmail(ctx.user?.email, {
                    name: ctx.user.name,
                    sport: sport?.name+" ["+sport?.league+"]" ,
                    bet: placedBet?.value,
                    placedBet,
                    price,
                    adminContext: {
                        userId: ctx.user._id,
                        userEmail: ctx.user.email,
                        userName: ctx.user.name,
                    },
                });
            }

            // log bet placement under this plan
            await addPlanLog({
                userId: ctx.user._id,
                orderId: ctx.order._id,
                type: "bet_placed",
                message: `Professional bet placed for ${price}.`,
                meta: { sport, placedBet, price, createdAt: new Date() },
            });
        }

        const data = new Bet({...req?.body, userId, accountType})
        await data.save();

        json(res, statusCode.OK, "Bet Placed");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const all = async (req, res) => {
    try {
        const user = req?.user;
        const isAdmin = isAdminUser(user);
        const { _id: userId } = user;

        const {
            _id: betId,
            price,
            status,
            accountType,
        } = req.query;

        const page = parseInt(req?.query?.page, 10) || 1;
        const limit = parseInt(req?.query?.limit, 10) || CONFIG.PAGE_LIMIT;
        const skip = (page - 1) * limit;

        const query = {};

        // If not admin → only fetch user's bets
        if (!isAdmin) {
            query.userId = userId;
        }

        // Filters
        if (betId) query._id = betId;
        if (status) query.status = { $in: status.split(",") };
        if (accountType) query.accountType = accountType;
        if (price) query.price = Number(price);

        // Get total count
        const total = await Bet.countDocuments(query);

        // Fetch paginated data
        const data = await Bet.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("userId");

        return json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        return json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const byId = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Bet.findById(id).populate("userId");
        if (!order) {
            return json(res, statusCode.NOT_FOUND, "Bet not found.");
        }

        json(res, statusCode.OK, RESPONSE_MESSAGES.DATA_FETCHED, order);
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
        const updated = await Bet.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return json(res, statusCode.NOT_FOUND, "Data not found.");
        }

        json(res, statusCode.OK, "Data updated successfully", updated);
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
        const deleted = await Bet.findByIdAndDelete(id);
        if (!deleted) {
            return json(res, statusCode.NOT_FOUND, "Data not found.");
        }

        json(res, statusCode.OK, "Data deleted successfully");
    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const finalizeBet = async (req, res) => {
    try {
        const { status } = req.body;
        const { id: betId } = req.params;

        if (![BET_STATUS.WIN, BET_STATUS.LOSE].includes(status)) {
            return json(res, statusCode.BAD_REQUEST, "Invalid status");
        }

        const bet = await Bet.findById(betId);

        if (!bet) {
            return json(res, statusCode.NOT_FOUND, "Bet not found");
        }

        if (bet.status === BET_STATUS.EXPIRE) {
            return json(res, statusCode.BAD_REQUEST, "Bet expired due to plan expiry and cannot be finalized");
        }

        if (bet.status !== BET_STATUS.PLACED) {
            return json(res, statusCode.BAD_REQUEST, "Bet already finalized");
        }

        const user = await User.findById(bet.userId);

        if (!user) {
            return json(res, statusCode.NOT_FOUND, "User not found");
        }

        const { placedBet, price, accountType } = bet;

        let pnl = 0;

        // WIN
        if (status === BET_STATUS.WIN) {
            pnl = price * placedBet?.value;
        }

        // LOSE
        if (status === BET_STATUS.LOSE) {
            pnl = price / placedBet?.value;

            if (pnl > price) {
                pnl = 0;
            }
        }

        // Update wallet
        if (accountType === ACCOUNT_TYPES.STANDARD) {
            user.walletS += pnl;
        } else {
            const ctx = await getActiveProfessionalPlanContext(user._id);

            if (!ctx?.order || !ctx?.startsAt || !ctx?.expiresAt || !user?.planStatus) {
                bet.status = BET_STATUS.EXPIRE;
                bet.pnl = 0;
                await bet.save();
                return json(res, statusCode.BAD_REQUEST, "Professional plan is not active. Bet expired and cannot be finalized");
            }

            const now = new Date();
            if (ctx.expiresAt && now >= ctx.expiresAt) {
                const expiredBetsCount = await expireProfessionalPlacedBets({
                    userId: user._id,
                    startsAt: ctx.startsAt,
                    expiresAt: ctx.expiresAt,
                });

                await addPlanLog({
                    userId: user._id,
                    orderId: ctx.order._id,
                    type: "plan_expired",
                    message: "Professional plan expired before bet finalization. Pending professional bets were marked expired and plan was closed.",
                    meta: {
                        reason: "duration_completed",
                        expiredBetsCount,
                        startsAt: ctx.startsAt,
                        expiresAt: ctx.expiresAt,
                    },
                });

                user.planStatus = null;
                user.activePlanOrderId = null;
                user.walletP = 0;
                await user.save();

                return json(res, statusCode.BAD_REQUEST, "Plan expired. Pending professional bets were marked expired");
            }

            user.walletP += pnl;

            // best-effort logs (only if this bet is within an active plan window)
            if (ctx?.order && ctx?.startsAt && ctx?.expiresAt) {
                const netProfit = computeNetProfit({ status, pnl, price });

                await addPlanLog({
                    userId: user._id,
                    orderId: ctx.order._id,
                    type: "bet_finalized",
                    message: `Professional bet finalized as ${status}. Net profit: ${netProfit}.`,
                    meta: { betId: bet._id, status, pnl, price, netProfit },
                });

                const stats = await computeProfessionalPlanStats({
                    userId: user._id,
                    orderId: ctx.order._id,
                    startsAt: ctx.startsAt,
                    expiresAt: ctx.expiresAt,
                    finalizedBetOverride: {
                        betId: bet._id,
                        status,
                        pnl,
                        price,
                    },
                });

                const minBettingDays = Number(ctx?.planInfo?.minBettingDays ?? 5);
                const maxDrawDown = Number(ctx?.planInfo?.drawDown ?? 0);
                const drawDownBreached = maxDrawDown > 0 && stats.totalLossAmount > maxDrawDown;
                const minDaysMet = stats.bettingDaysCount >= minBettingDays;
                const now = new Date();
                const expiredByDuration = ctx.expiresAt ? now >= ctx.expiresAt : false;
                const expiredByMinDays = expiredByDuration && !minDaysMet;
                const expiredByDrawDown = drawDownBreached;
                const eligible = (!expiredByDuration) && (!expiredByDrawDown);
                const ineligible = !eligible;

                await addPlanLog({
                    userId: user._id,
                    orderId: ctx.order._id,
                    type: "eligibility_updated",
                    message: `Eligibility updated. bettingDays=${stats.bettingDaysCount}/${minBettingDays}, totalNetProfit=${stats.totalNetProfit}, totalLoss=${stats.totalLossAmount}, drawDownMax=${maxDrawDown}, eligible=${eligible}.`,
                    meta: {
                        bettingDaysCount: stats.bettingDaysCount,
                        minBettingDays,
                        totalNetProfit: stats.totalNetProfit,
                        totalLossAmount: stats.totalLossAmount,
                        drawDown: maxDrawDown,
                        drawDownBreached,
                        expiredByDuration,
                        expiredByMinDays,
                        expiredByDrawDown,
                        eligible,
                        startsAt: ctx.startsAt,
                        expiresAt: ctx.expiresAt,
                    },
                });

                if (ineligible) {
                    const reasons = [];
                    if (expiredByDuration) reasons.push("duration_completed");
                    if (expiredByMinDays) reasons.push("min_betting_days_not_met");
                    if (expiredByDrawDown) reasons.push("drawdown_limit_breached");

                    await addPlanLog({
                        userId: user._id,
                        orderId: ctx.order._id,
                        type: "plan_expired",
                        message: `Professional plan became ineligible (${reasons.join(", ")}). bettingDays=${stats.bettingDaysCount}/${minBettingDays}, totalLoss=${stats.totalLossAmount}/${maxDrawDown}. Plan has been closed and professional wallet reset.`,
                        meta: {
                            reasons,
                            bettingDaysCount: stats.bettingDaysCount,
                            minBettingDays,
                            totalLossAmount: stats.totalLossAmount,
                            drawDown: maxDrawDown,
                            startsAt: ctx.startsAt,
                            expiresAt: ctx.expiresAt,
                            finalizedBetId: bet._id,
                        },
                    });

                    if (expiredByDuration || expiredByMinDays) {
                        const expiredBetsCount = await expireProfessionalPlacedBets({
                            userId: user._id,
                            startsAt: ctx.startsAt,
                            expiresAt: ctx.expiresAt,
                        });

                        await addPlanLog({
                            userId: user._id,
                            orderId: ctx.order._id,
                            type: "eligibility_updated",
                            message: `Pending professional bets were marked expired after plan closure. expiredBetsCount=${expiredBetsCount}.`,
                            meta: {
                                expiredBetsCount,
                                startsAt: ctx.startsAt,
                                expiresAt: ctx.expiresAt,
                            },
                        });
                    }

                    user.planStatus = null;
                    user.activePlanOrderId = null;
                    user.walletP = 0;
                }
            }
        }

        // Update bet
        bet.pnl = pnl;
        bet.status = status;

        await bet.save();
        await user.save();

        // send bet result email (win/lose)
        if (user?.email) {
            sendBetResultEmail(user.email, {
                name: user?.name,
                sport: bet?.sport?.name+" ["+bet?.sport?.league+"]" ,
                bet: placedBet?.value,
                placedBet: bet.placedBet,
                price: bet.price,
                status,
                pnl,
                adminContext: {
                    userId: user._id,
                    userEmail: user.email,
                    userName: user.name,
                },
            });
        }

        json(res, statusCode.OK, "Bet finalized");

    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};
module.exports.BetController = {
    create,
    all,
    byId,
    update,
    destroy,
    finalizeBet
};
module.exports.getActiveProfessionalPlanContext = getActiveProfessionalPlanContext;
module.exports.computeProfessionalPlanStats = computeProfessionalPlanStats;
