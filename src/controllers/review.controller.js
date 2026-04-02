const asyncHandler = require("../utils/asyncHandler");
const reviewService = require("../services/review.service");
const analyticsQueue = require("../queues/analytics.queue");

exports.createReview = asyncHandler(async (req, res) => {

    const review = await reviewService.createReview(req.body, req.user.id);

    await analyticsQueue.add();

    res.status(201).json({
        success: true,
        review
    });

});

exports.getReviewsByMovie = asyncHandler(async (req, res) => {

    const reviews = await reviewService.getMovieReviews(req.params.id, req.query);

    res.status(200).json({
        success: true,
        results: reviews.length,
        reviews
    });

});

exports.updateReview = asyncHandler(async (req, res) => {

    const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);

    res.status(200).json({
        success: true,
        review
    });

});

exports.deleteReview = asyncHandler(async (req, res) => {

    await reviewService.deleteReview(req.params.id, req.user._id, req.user.role);

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });

});

exports.getMyReviews = asyncHandler(async (req, res) => {

    const data = await reviewService.getMyReviews(req.user._id, req.query);

    res.status(200).json({
        success: true,
        ...data
    });

});


