const cron = require("node-cron");
const Review = require("../models/review.model");

cron.schedule("0 0 * * *", async () => {

    console.log("Deleting old reviews...");

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await Review.deleteMany({
        createdAt: { $lt: oneYearAgo }
    });

    console.log("Old reviews removed");

});