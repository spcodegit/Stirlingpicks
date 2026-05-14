const mongoose = require("mongoose");

const faq = new mongoose.Schema(
    {
        question: {type: String, required: true},
        answer: {type: String, required: true},
        status: {type: String, required: true, default: true},
    },
    {timestamps: true},
);

const Faq = mongoose.model("Faq", faq);
module.exports = Faq;