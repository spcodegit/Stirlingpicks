const {BetController} = require("../controllers/bet");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/").post(isAuthenticated, isAuthorized(ROLES.USER), BetController.create);
router.route("/all").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), BetController.all);
router.route("/:id").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), BetController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), BetController.update);
router.route("/finalize/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), BetController.finalizeBet);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), BetController.destroy);

module.exports = router;