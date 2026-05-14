const jwt = require('jsonwebtoken');
const {CONFIG} = require("../config/config");


// generate jwt token
module.exports.generateJwtToken = function (data) {
    return jwt.sign({ data: data }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRE })
}
