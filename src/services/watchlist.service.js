const Watchlist = require('../models/watchlist.model');
const Movie = require('../models/movie.model');
const { redisClient } = require('../config/db');

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

    const watched = await Watchlist.findOne({ userId }).populate("movieIds", "genre").select('movieIds')

    console.log("🚀 ~ watched:", watched)

    const genres = []

    watched.movieIds.forEach(element => {
        for (let i of element.genre) {
            genres.push(i)
        }
    })

    console.log("🚀 ~ genres:", genres)


    const recommendations = await Movie.find({
        genre: { $in: genres }
    }).limit(10)

    if (recommendations.length == 0) return console.log("no recommendation");

    console.log("🚀 ~ recommendations:", recommendations)


    const result = { source: 'genre-based', genres, movies: recommendations, };
    return result

}
