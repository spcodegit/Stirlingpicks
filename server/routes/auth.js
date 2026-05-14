const {AuthController} = require("../controllers/auth");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/register").post(AuthController.register);
router.route("/login").post(AuthController.login);
router.route("/verify").get(AuthController.verify);
router.route("/forgot").post(AuthController.forgotPassword);
router.route("/me").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), AuthController.me);
router.route("/users").get(isAuthenticated, isAuthorized(ROLES.ADMIN), AuthController.allUsers);
router.route("/admin/counters").get(isAuthenticated, isAuthorized(ROLES.ADMIN), AuthController.adminCounters);
router.route("/update/:id").put(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), AuthController.update);
router.route("/delete/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), AuthController.destroy);
router.route("/password/change").put(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), AuthController.changePassword);
router.route("/account/change").put(isAuthenticated, isAuthorized(ROLES.USER), AuthController.updateAccountType);

module.exports = router;