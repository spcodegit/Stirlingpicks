const mongoose = require('mongoose');

const sports = new mongoose.Schema({
    data: {type: [mongoose.Schema.Types.Mixed], required: true}
}, {timestamps: true});

const Sports = mongoose.model("Sports", sports);
module.exports = Sports