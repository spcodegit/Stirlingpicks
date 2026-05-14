const mongoose = require("mongoose");
const {BET_STATUS, PLACED_BET_NAME} = require("../constants/bet");
const {ACCOUNT_TYPES} = require("../constants/roles");

const bet = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        sport: {
            name: {type: String, required: true},
            league: {type: String, required: true},
        },
        bet: {type: Object, required: true},
        placedBet: {
            name: {
                type: String,
                enum: [PLACED_BET_NAME.HOME, PLACED_BET_NAME.DRAW, PLACED_BET_NAME.AWAY],
                required: true
            },
            value: {type: Number, required: true},
        },
        price: {type: Number, required: true},
        status: {
            type: String,
            enum: [BET_STATUS.PLACED, BET_STATUS.FINALIZING, BET_STATUS.WIN, BET_STATUS.LOSE, BET_STATUS.EXPIRE],
            default: BET_STATUS.PLACED
        },
        accountType: {
            type: String,
            enum: [ACCOUNT_TYPES.STANDARD, ACCOUNT_TYPES.PROFESSIONAL],
            required: true
        },
        pnl: {type: Number, default: null},
    },
    {timestamps: true},
);

const Bet = mongoose.model("Bet", bet);
module.exports = Bet;