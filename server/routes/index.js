const test = require("./test");
const auth = require("./auth");
const oddapi = require("./oddapi");
const nowpayment = require("./nowpayment");
const order = require("./order");
const bet = require("./bet");
const faq = require("./faq");
const payout = require("./payout");
const support = require("./support");
const plan = require("./plan");
const planLogs = require("./planLogs");

module.exports = function (server) {
    server.use(test);
    server.use('/api/auth', auth)
    server.use('/api/bet', oddapi)
    server.use('/api/nowpayment', nowpayment)
    server.use('/api/order', order)
    server.use('/api/bet', bet)
    server.use('/api/faq', faq)
    server.use('/api/payout', payout)
    server.use('/api/support', support)
    server.use('/api/plan', plan)
    server.use('/api/plan-logs', planLogs)
};
