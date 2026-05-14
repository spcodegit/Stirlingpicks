const Sports = require("../../models/sports");
const Odds = require("../../models/odds");
const axios = require("axios");
const {CONFIG} = require("../../config/config");

// seed sports odds
module.exports.updateSportsOddData = async function () {
    try {
        const sportsDoc = await Sports.findOne();
        const sportsData = sportsDoc?.data || [];

        // 1️⃣ Group keys by sport name
        const groupedKeys = sportsData.reduce((acc, item) => {
            if (!acc[item.group]) acc[item.group] = [];
            acc[item.group].push(item.key);
            return acc;
        }, {});

        // 2️⃣ Process each sport group
        for (const [sportName, sportKeys] of Object.entries(groupedKeys)) {

            let mergedOdds = [];

            for (const key of sportKeys) {
                try {
                    const URL = `${CONFIG.ODD_API_URL}/sports/${key}/odds/?apiKey=${CONFIG.ODD_API_KEY}&regions=us,uk,eu&markets=h2h&dateFormat=iso&oddsFormat=decimal`
                    console.log(URL)
                    const response = await axios.get(URL);

                    if (Array.isArray(response.data)) {
                        mergedOdds.push(...response.data);
                    }

                } catch (err) {
                    console.error(`Failed to fetch odds for ${key}:`, err.message);
                }
            }

            // 3️⃣ Upsert odds per sport group
            await Odds.findOneAndUpdate(
                { name: sportName },
                {
                    name: sportName,
                    data: mergedOdds
                },
                { upsert: true, new: true }
            );

            console.log(`✅ Saved odds for ${sportName} (${mergedOdds.length} records)`);
        }

        console.log("🎯 All sports odds updated successfully");

    } catch (e) {
        console.error("❌ Odds update failed:", e);
    }
};

module.exports.decimalToFraction = function (decimal) {
    if (!decimal || decimal <= 1) return null;

    const value = decimal - 1;
    const tolerance = 1.0E-6;

    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = value;

    do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;

        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;

        b = 1 / (b - a);
    } while (Math.abs(value - h1 / k1) > value * tolerance);

    return `${h1}/${k1}`;
};

