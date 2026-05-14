const json = require("../helpers/json_response");
const { updateSportsData } = require("../helpers/controller/sports");
const { updateSportsOddData } = require("../helpers/controller/odds");
const {CONFIG} = require("../config/config");

// seed data
const seedData = async (req, res) => {
    const { code } = req.query;

    // validate code from query params
    console.log("Code: ", code);
    console.log("Secret code: ", CONFIG.SECRET_SEED_CODE);
    console.log("Code match: ", code == CONFIG.SECRET_SEED_CODE);
    if (code != CONFIG.SECRET_SEED_CODE) {
        return json(res, 401, "Unauthorized, Invalid code provided, Aborting...");
    }

    console.log("-----------Seed data started-----------");

    json(res, 200, "Welcome, Seed Data Started");

    await updateSportsData();
    await updateSportsOddData();

    console.log("-----------Seed data completed-----------");

    return;
};

module.exports.SeedController = {
    seedData,
};