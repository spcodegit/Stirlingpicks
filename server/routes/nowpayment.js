const {NowPaymentController} = require("../controllers/nowpayment");
const {isAuthenticated, isAuthorized} = require("../middlewares/authentication");
const {ROLES} = require("../constants/roles");
const router = require("express").Router();


router.route("/selected-currencies").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), NowPaymentController.selectedCurrencies);
router.route("/all-currencies").get(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), NowPaymentController.allCurrencies);
router.route("/create-payment").post(isAuthenticated, isAuthorized(ROLES.USER, ROLES.ADMIN), NowPaymentController.createPayment);
router.route("/webhook").post(NowPaymentController.webhook);
router.route("/payment/status/:id").get(NowPaymentController.paymentStatus);


module.exports = router;