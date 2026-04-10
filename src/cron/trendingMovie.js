const cron = require("node-cron");
const analyticsQueue = require("../queues/analytics.queue");

cron.schedule("0 * * * *", async () => {
    console.log("Cron: Trigger trending movie analytics");

    await analyticsQueue.add();

});