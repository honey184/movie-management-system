const analyticsQueue = require("../queues/analytics.queue");
const { getMostReviewed } = require("../services/movie.service");
const { redisClient } = require("../config/db");

analyticsQueue.process(async () => {
    console.log("Trending movies update started");

    await getMostReviewed();

});



