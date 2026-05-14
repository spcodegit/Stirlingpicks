const STATUSCODE = require("http-status-codes")
const crypto = require("crypto")
const {CONFIG} = require("../config/config");
const {RESPONSE_MESSAGES} = require("../constants/response_message");

// Encryption function using AES-256-CBC
function encryptData(data) {
    if (!data || data === null) return null;

    const encryptionKey = CONFIG.ENCRYPTION_KEY;
    if (!encryptionKey) {
        throw new Error("ENCRYPTION_KEY environment variable is required");
    }

    try {
        // Convert the encryption key to a 32-byte key for AES-256
        const key = crypto.createHash('sha256').update(encryptionKey).digest();

        // Generate a random 16-byte IV
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        // Encrypt the data (convert to string first)
        const dataString = JSON.stringify(data);
        let encrypted = cipher.update(dataString, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Combine IV and encrypted data (IV:encryptedData)
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Data encryption failed');
    }
}

module.exports = (res, statusCode, message, data) => {
    try {
        let encryptedData
        if (data !== null && CONFIG.ENV === 'prod') {
            encryptedData = encryptData(data);
        }
        else {
            encryptedData = data;
        }

        if (encryptedData === null && data === null) {
            res.status(STATUSCODE.OK).json({status: statusCode, message});
        } else if (message === null) {
            res.status(STATUSCODE.OK).json({status: statusCode, data: encryptedData});
        } else {
            res.status(STATUSCODE.OK).json({status: statusCode, message, data: encryptedData});
        }
    } catch (error) {
        console.error('JSON response error:', error);
        res.status(STATUSCODE.INTERNAL_SERVER_ERROR).json({
            status: 500,
            message: {
                user: RESPONSE_MESSAGES.USER_INTERNAL_SERVER_ERROR,
                system: error.message
            }
        });
    }
};
