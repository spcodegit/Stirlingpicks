const {PayoutController} = require("../controllers/payout");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/").get(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), PayoutController.all);
router.route("/").post(isAuthenticated, isAuthorized(ROLES.USER), PayoutController.create);
router.route("/:id").get(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), PayoutController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), PayoutController.update);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), PayoutController.destroy);

module.exports = router;