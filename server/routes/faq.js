const {FaqController} = require("../controllers/faq");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/").get(FaqController.all);
router.route("/").post(isAuthenticated, isAuthorized(ROLES.ADMIN), FaqController.create);
router.route("/:id").get(isAuthenticated, isAuthorized(ROLES.ADMIN, ROLES.USER), FaqController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), FaqController.update);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), FaqController.destroy);

module.exports = router;