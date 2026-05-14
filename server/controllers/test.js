const json = require("../helpers/json_response");

// test
const testServer = async (req, res) => {
    return json(res, 200, "Welcome, Server is Working");
};

module.exports.TestController = {
    testServer,
};
