

const watchlistService = require('../services/watchlist.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getWatchlist = asyncHandler(async (req, res) => {
    const data = await watchlistService.getWatchlist(req.user._id);
    res.status(200).json({ success: true, data });
});

exports.addToWatchlist = asyncHandler(async (req, res) => {
    const { movieId } = req.body;

    if (!movieId) {
        return res.status(400).json({
            success: false,
            message: 'movieId is required',
        });
    }

    const data = await watchlistService.addToWatchlist(req.user._id, movieId);
    res.status(200).json({ success: true, data });
});

exports.removeFromWatchlist = asyncHandler(async (req, res) => {
    const { movieId } = req.params;

    const data = await watchlistService.removeFromWatchlist(
        req.user._id,
        movieId
    );

    res.status(200).json({ success: true, data });
});

exports.clearWatchlist = asyncHandler(async (req, res) => {
    await watchlistService.clearWatchlist(req.user._id);

    res.status(200).json({
        success: true,
        message: 'Watchlist cleared',
    });
});

exports.getRecommendations = asyncHandler(async (req, res) => {
    console.log("🔥 Recommendations API HIT");

    const data = await watchlistService.getRecommendations(req.user._id);

    res.status(200).json({
        success: true,
        ...data,
    });
});