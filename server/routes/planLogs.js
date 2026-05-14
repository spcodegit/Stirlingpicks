const { PlanLogsController } = require("../controllers/planLogs");
const { isAuthenticated, isAuthorized } = require("../middlewares/authentication");
const { ROLES } = require("../constants/roles");
const router = require("express").Router();

router.route("/all").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), PlanLogsController.allByUserAndOrder);

module.exports = router;
