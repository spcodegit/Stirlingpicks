const mongoose = require('mongoose');
const {CONFIG} = require("../config/config");

mongoose.connect(CONFIG?.DB_URI, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    // bufferMaxEntries: 0,
    // maxPoolSize: 10,
    // minPoolSize: 5
})
    .then(() => {
        console.log(`Connected to MongoDB ${CONFIG?.DB_ENVIRONMENT}`);
    })
    .catch((error) => {
        console.log(error);
    });