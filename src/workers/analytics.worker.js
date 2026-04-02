const analyticsQueue = require("../queues/analytics.queue");
const { getMostReviewed, getTopRated } = require("../services/movie.service");

analyticsQueue.process(async () => {
    console.log("Trending movies update started");

    await getMostReviewed();

    await getTopRated();

});



