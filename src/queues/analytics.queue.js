const Queue = require("bull");

const analyticsQueue = new Queue(
    "analytics-queue",
    "redis://127.0.0.1:6379"
);

module.exports = analyticsQueue;