const {PlanController} = require("../controllers/plan");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();

router.route("/").get(PlanController.all);
router.route("/").post(isAuthenticated, isAuthorized(ROLES.ADMIN), PlanController.create);
router.route("/:id").get(PlanController.byId);
router.route("/:id").put(isAuthenticated, isAuthorized(ROLES.ADMIN), PlanController.update);
router.route("/:id").delete(isAuthenticated, isAuthorized(ROLES.ADMIN), PlanController.destroy);

module.exports = router;