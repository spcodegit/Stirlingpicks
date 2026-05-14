const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {CONFIG} = require("../config/config");
const crypto = require('crypto');

// Encrypt Password
module.exports.encryptPassword = function (data) {
    return bcrypt.hashSync(data, 5);
}

// Compare encrypt password
module.exports.compareEncryptedPassword = function (orignalPassword, hashPassword) {
    return bcrypt.compareSync(orignalPassword, hashPassword)
}

// Generate JWT token
module.exports.generateJwtToken = function (data) {
    return jwt.sign({data: data}, CONFIG.JWT_EXPIRE, {expiresIn: CONFIG.JWT_EXPIRE})
}

module.exports.generateUserVerificationCode = function () {
    return crypto.randomBytes(22).toString("base64url").slice(0, 30);
}

module.exports.isAdminUser = (user) => user?.role === 0 && user?.type === "admin";

// Helper to convert array to object
module.exports.formatCounts = (arr, statuses = []) => {
    const obj = {};
    statuses.forEach(s => obj[s] = 0);

    arr.forEach(item => {
        obj[item._id] = item.count;
    });

    obj.total = Object.values(obj).reduce((a, b) => a + b, 0);
    return obj;
};
