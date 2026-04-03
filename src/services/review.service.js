const Review = require('../models/review.model');
const Movie = require('../models/movie.model');
const ApiFeatures = require('../utils/apiFeatures');
const { redisClient } = require('../config/db');
const mongoose = require('mongoose')
const objectIdValidator = require('../utils/objectidValidate');

const CACHE_TTL = parseInt(process.env.REDIS_TTL) || 60;

const clearReviewCache = async (movieId) => {

    const keys = await redisClient.keys(`reviews:${movieId}:*`);
    if (keys.length) await redisClient.del(keys);

    const movieKeys = await redisClient.keys('movies:*');
    if (movieKeys.length) await redisClient.del(movieKeys);

};


exports.getMovieReviews = async (movieId, queryString) => {

    await objectIdValidator(movieId);

    const cacheKey = `reviews:${movieId}:${JSON.stringify(queryString)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);


    const movie = await Movie.findById(movieId).select('title ratingsAvg ratingsCount');
    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    const features = new ApiFeatures(
        Review.find({ movieId }).populate('userId', 'name email'),
        queryString
    ).filter().sort().paginate();

    const [reviews, total] = await Promise.all([
        features.query,
        Review.countDocuments({ movieId }),
    ]);

    const result = { movie, total, ...features.pagination, reviews };
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;

};

exports.createReview = async (data, userId) => {

    const { movieId, rating, comment } = data;

    const movie = await Movie.findById(movieId);
    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    const existing = await Review.findOne({ userId, movieId });
    if (existing) throw { statusCode: 400, message: 'You have already reviewed this movie' };

    const review = await Review.create({ userId, movieId, rating, comment });
    await clearReviewCache(movieId);
    return review;

};

exports.updateReview = async (reviewId, userId, data) => {

    await objectIdValidator(reviewId);

    const review = await Review.findOne({
        _id: new mongoose.Types.ObjectId(reviewId),
        userId
    });
    if (!review) throw { statusCode: 404, message: 'Review not found or not authorized' };

    Object.assign(review, data);
    await review.save();

    await clearReviewCache(review.movieId);
    return review;

};

exports.deleteReview = async (reviewId, userId, role) => {

    await objectIdValidator(reviewId);

    const filter = role === 'admin' ? { _id: reviewId } : { _id: reviewId, userId };
    const review = await Review.findOneAndDelete(filter);
    if (!review) throw { statusCode: 404, message: 'Review not found or not authorized' };

    await clearReviewCache(review.movieId);
    return review;

};

exports.getMyReviews = async (userId, queryString) => {

    const features = new ApiFeatures(
        Review.find({ userId }).populate('movieId', 'title genre ratingsAvg'),
        queryString
    ).paginate();

    const [reviews, total] = await Promise.all([
        features.query,
        Review.countDocuments({ userId }),
    ]);

    return { total, ...features.pagination, reviews };

};