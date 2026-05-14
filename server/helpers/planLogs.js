const PlanLogs = require("../models/planLogs");

async function getPlanLogsForUserOrder(userId, orderId) {
  return PlanLogs.find({ userId, orderId }).sort({ createdAt: 1 });
}

async function addPlanLog({ userId, orderId, type, message, meta = null }) {
  const log = new PlanLogs({ userId, orderId, type, message, meta });
  await log.save();
  return log;
}

module.exports = {
  getPlanLogsForUserOrder,
  addPlanLog,
};

