const {OrderController} = require("../controllers/order");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/all").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), OrderController.all);
router.route("/:id").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), OrderController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), OrderController.update);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), OrderController.destroy);

module.exports = router;