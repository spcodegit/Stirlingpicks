const {TestController} = require("../controllers/test");
const router = require("express").Router();


router.route("/").get(TestController.testServer);


module.exports = router;