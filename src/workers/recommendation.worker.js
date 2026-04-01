const recommendationQueue = require('../queues/recommendation.queue');
const { getRecommendations } = require('../services/watchlist.service');

recommendationQueue.process(async (job) => {

    const { userId } = job.data;

    console.log("Generating recommendations for:", userId);

    await getRecommendations(userId);

});