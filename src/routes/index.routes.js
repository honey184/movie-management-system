const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const movieRoutes = require("./movie.routes");
const reviewRoutes = require("./review.routes");
const watchlistRoutes = require('./watchlist.routes');
const bookingRoutes = require('./booking.routes');

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/reviews", reviewRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;