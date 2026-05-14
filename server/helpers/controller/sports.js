const Sports = require("../../models/sports");
const axios = require("axios");
const {CONFIG} = require("../../config/config");

// seed sports
module.exports.updateSportsData = async function () {
    try {
        const sports = await Sports.find()
        console.log("Available sports:", sports)

        if (sports.length === 0) {
            console.log("No sports exist, creating from scratch")

            const data = await axios.get(`${CONFIG.ODD_API_URL}/sports/?api_key=${CONFIG.ODD_API_KEY}&all=true`)
            const newSports = new Sports({data: data?.data});
            await newSports.save();

            console.log("Sports created successfully")
        } else {
            console.log("Sports already exist, updating")

            const sportsId = sports[0]?._id
            console.log("Sports Id: ", sportsId)

            const data = await axios.get(`${CONFIG.ODD_API_URL}/sports/?api_key=${CONFIG.ODD_API_KEY}&all=true`)
            await Sports.findByIdAndUpdate(
                sportsId,
                {
                    data: data?.data
                },
                {
                    new: true,
                    runValidators: true,
                });

            console.log("Sports updated successfully")
        }


    } catch (e) {
        console.error('Seeding failed:', e);
    }
}