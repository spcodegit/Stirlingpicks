const {OddApiController} = require("../controllers/oddapi");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/sports").get(OddApiController.allSports);
router.route("/odds-by-sport").get(OddApiController.oddsAgainstSports);

module.exports = router;