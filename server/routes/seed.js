const {SeedController} = require("../controllers/seed");
const router = require("express").Router();


router.route("/").get(SeedController.seedData);


module.exports = router;