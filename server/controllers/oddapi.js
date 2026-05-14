const json = require('../helpers/json_response')
const statusCode = require("http-status-codes")
const {RESPONSE_MESSAGES} = require("../constants/response_message");
const Sports = require("../models/sports");
const Odds = require("../models/odds");
const {decimalToFraction} = require("../helpers/controller/odds");


const allSports = async (req, res) => {
    try {
        const { groupNames, keys } = req.query;

        const sportsDoc = await Sports.findOne();
        const sportsData = sportsDoc?.data || [];

        // Build grouped keys once (used in multiple cases)
        const groupedKeys = sportsData.reduce((acc, item) => {
            if (!acc[item.group]) {
                acc[item.group] = [];
            }
            acc[item.group].push(item.key);
            return acc;
        }, {});

        // ✅ BOTH true → grouped keys by group
        if (groupNames === "true" && keys === "true") {
            return json(
                res,
                statusCode.OK,
                RESPONSE_MESSAGES.DATA_FETCHED,
                groupedKeys
            );
        }

        // ✅ Only groupNames=true → list of group names
        if (groupNames === "true") {
            return json(
                res,
                statusCode.OK,
                RESPONSE_MESSAGES.DATA_FETCHED,
                Object.keys(groupedKeys)
            );
        }

        // ✅ Only keys=true → grouped keys by group
        if (keys === "true") {
            return json(
                res,
                statusCode.OK,
                RESPONSE_MESSAGES.DATA_FETCHED,
                groupedKeys
            );
        }

        // ✅ Default → full data
        return json(
            res,
            statusCode.OK,
            RESPONSE_MESSAGES.DATA_FETCHED,
            sportsData
        );

    } catch (error) {
        json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};

const oddsAgainstSports = async (req, res) => {
    try {
        const { sportName, output } = req.query;

        const oddsDataDoc = await Odds.find({ name: sportName });
        const oddsData = oddsDataDoc[0]?.data || [];

        const groupedByLeague = oddsData.reduce((acc, match) => {
            const league = match.sport_title;

            if (!match.bookmakers || match.bookmakers.length === 0) {
                return acc;
            }

            let selectedBookmaker = match.bookmakers.find(
                (bm) => bm.key === "draftkings"
            ) || match.bookmakers[0];

            // convert odds if needed
            if (output === "fra") {
                selectedBookmaker = {
                    ...selectedBookmaker,
                    markets: selectedBookmaker.markets.map((market) => ({
                        ...market,
                        outcomes: market.outcomes.map((outcome) => ({
                            ...outcome,
                            price: decimalToFraction(outcome.price)
                        }))
                    }))
                };
            }

            const formattedMatch = {
                id: match.id,
                commence_time: match.commence_time,
                home_team: match.home_team,
                away_team: match.away_team,
                bookmaker: selectedBookmaker
            };

            if (!acc[league]) acc[league] = [];
            acc[league].push(formattedMatch);

            return acc;
        }, {});

        return json(
            res,
            statusCode.OK,
            RESPONSE_MESSAGES.DATA_FETCHED,
            groupedByLeague
        );

    } catch (error) {
        return json(res, statusCode.INTERNAL_SERVER_ERROR, {
            user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
            system: error.message
        });
    }
};


module.exports.OddApiController = {
    allSports,
    oddsAgainstSports
};
