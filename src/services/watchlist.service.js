const Watchlist = require('../models/watchlist.model');
const Movie = require('../models/movie.model');
const { redisClient } = require('../config/db');
const objectIdValidator = require('../utils/objectidValidate');

const CACHE_TTL = parseInt(process.env.REDIS_TTL) || 60;

const clearWatchlistCache = async (userId) => {

    await redisClient.del(`watchlist:${userId}`);
    await redisClient.del(`recommendations:${userId}`);

};

exports.getWatchlist = async (userId) => {

    const cacheKey = `watchlist:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const watchlist = await Watchlist.findOne({ userId }).populate(
        'movieIds',
        'title genre releaseYear ratingsAvg ratingsCount'
    );

    const result = watchlist || { userId, movieIds: [] };
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;

};

exports.addToWatchlist = async (userId, movieId) => {

    const movie = await Movie.findById(movieId).select('title');
    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    const watchlist = await Watchlist.findOneAndUpdate(
        { userId },
        { $addToSet: { movieIds: movieId } },
        { upsert: true, new: true }
    ).populate('movieIds', 'title genre releaseYear ratingsAvg');

    await clearWatchlistCache(userId);
    return watchlist;

};


exports.removeFromWatchlist = async (userId, movieId) => {

    await objectIdValidator(movieId);

    const watchlist = await Watchlist.findOneAndUpdate(
        { userId },
        { $pull: { movieIds: movieId } },
        { new: true }
    ).populate('movieIds', 'title genre releaseYear ratingsAvg');

    if (!watchlist) throw { statusCode: 404, message: 'Watchlist not found' };
    await clearWatchlistCache(userId);
    return watchlist;

};

exports.clearWatchlist = async (userId) => {

    const watchlist = await Watchlist.findOneAndUpdate(
        { userId },
        { $set: { movieIds: [] } },
        { new: true }
    );
    if (!watchlist) throw { statusCode: 404, message: 'Watchlist not found' };
    await clearWatchlistCache(userId);
    return watchlist;

};


exports.getRecommendations = async (userId) => {

    const cacheKey = `recommendations:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const watchlist = await Watchlist.findOne({ userId }).populate(
        'movieIds',
        'genre'
    );

    if (!watchlist || watchlist.movieIds.length === 0) {

        const topRated = await Movie.find({ ratingsCount: { $gte: 5 } })
            .sort({ ratingsAvg: -1 })
            .limit(10)
            .select('title genre releaseYear ratingsAvg ratingsCount');
        return { source: 'top-rated', movies: topRated };
    }

    const genres = [
        ...new Set(watchlist.movieIds.flatMap((m) => m.genre)),
    ];


    const watchedIds = watchlist.movieIds.map((m) => m._id);

    const recommendations = await Movie.find({
        genre: { $in: genres },
        _id: { $nin: watchedIds },
        ratingsCount: { $gte: 2 },
    })
        .sort({ ratingsAvg: -1 })
        .limit(10)
        .select('title genre releaseYear ratingsAvg ratingsCount');

    const result = { source: 'genre-based', genres, movies: recommendations };
    await redisClient.setEx(cacheKey, CACHE_TTL * 5, JSON.stringify(result));
    return result;

};