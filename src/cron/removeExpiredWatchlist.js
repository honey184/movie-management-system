const cron = require("node-cron");
const Watchlist = require("../models/watchlist.model");

cron.schedule("0 3 * * *", async () => {

    console.log("Removing expired watchlists");

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    await Watchlist.deleteMany({
        updatedAt: { $lt: twoYearsAgo }
    });

});