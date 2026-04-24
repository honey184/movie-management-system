const cron = require("node-cron");
const { redisClient } = require("../config/db");

cron.schedule("0 * * * *", async () => {

    console.log("Clearing Redis cache");

    await redisClient.flushAll();

});
