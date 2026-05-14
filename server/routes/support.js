const {SupportController} = require("../controllers/support");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/").get(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), SupportController.all);
router.route("/").post(isAuthenticated, isAuthorized(ROLES.USER), SupportController.create);
router.route("/:id").get(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), SupportController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), SupportController.update);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), SupportController.destroy);

module.exports = router;