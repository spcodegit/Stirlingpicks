const mongoose = require('mongoose');

const odds = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    data: {type: [mongoose.Schema.Types.Mixed], required: true}
}, {timestamps: true});

const Odds = mongoose.model("Odds", odds);
module.exports = Odds