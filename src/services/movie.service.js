const Movie = require('../models/movie.model');
const Review = require('../models/review.model');
const ApiFeatures = require('../utils/apiFeatures');
const { redisClient } = require('../config/db');
const objectIdValidator = require('../utils/objectidValidate');

const CACHE_TTL = parseInt(process.env.REDIS_TTL) || 60;

const getCached = async (key) => {

    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;

};

const setCache = async (key, data, ttl = CACHE_TTL) => {

    await redisClient.setEx(key, ttl, JSON.stringify(data));

};

const clearMovieCache = async () => {

    const keys = await redisClient.keys('movies:*');
    if (keys.length) await redisClient.del(keys);

};

exports.getAllMovies = async (queryString) => {
    const cacheKey = `movies:all:${JSON.stringify(queryString)}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const features = new ApiFeatures(Movie.find(), queryString)
        .search()
        .filter()
        .sort()
        .limitFields();

    const countQuery = new ApiFeatures(Movie.find(), queryString)
        .search()
        .filter();

    const totalCount = await countQuery.query.countDocuments();

    features.paginate();
    const movies = await features.query;

    const result = {
        ...features.pagination,
        movies,
        total: totalCount
    };

    await setCache(cacheKey, result);

    return result;
};


exports.searchMovies = async (queryString) => {

    if (!queryString.q) {
        throw { statusCode: 400, message: 'Search query (q) is required' };
    }

    const cacheKey = `movies:search:${JSON.stringify(queryString)}`;

    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const features = new ApiFeatures(Movie.find(), queryString)
        .search()
        .filter()
        .sort();

    const countQuery = new ApiFeatures(Movie.find(), queryString)
        .search()
        .filter();

    const totalCount = await countQuery.query.countDocuments();

    features.paginate();

    const movies = await features.query;

    const result = {
        ...features.pagination,
        count: movies.length,
        total: totalCount,
        movies,
    };

    await setCache(cacheKey, result, 30);

    return result;
};

exports.getMovieById = async (id) => {

    await objectIdValidator(id);

    const cacheKey = `movies:id:${id}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const movie = await Movie.findById(id);
    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    await setCache(cacheKey, movie);
    return movie;

};


exports.createMovie = async (data) => {

    const { title, genre, releaseYear } = data

    const movie = await Movie.findOne({ title: title, genre: genre, releaseYear: releaseYear })

    if (movie) throw { statusCode: 400, message: "Movie already exist" }


    const movieCreate = await Movie.create(data);
    await clearMovieCache();
    return movieCreate;

};


exports.updateMovie = async (id, data) => {

    await objectIdValidator(id);

    const movie = await Movie.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    await clearMovieCache();
    await redisClient.del(`movies:id:${id}`);
    return movie;

};


exports.deleteMovie = async (id) => {

    await objectIdValidator(id);
    const movie = await Movie.findByIdAndDelete(id);

    await Review.deleteMany({ movieId: id });

    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    await clearMovieCache();
    await redisClient.del(`movies:id:${id}`);
    return movie;

};


exports.getTopRated = async () => {

    const cacheKey = 'movies:analytics:top-rated';
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const movies = await Movie.aggregate([
        { $match: { ratingsCount: { $gte: 5 } } },
        { $sort: { ratingsAvg: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                title: 1,
                genre: 1,
                ratingsAvg: 1,
                ratingsCount: 1,
                releaseYear: 1
            }
        }
    ]);

    await setCache(cacheKey, movies, 300);
    return movies;
};


exports.getMostReviewed = async () => {

    const cacheKey = 'movies:analytics:most-reviewed';
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const result = await Movie.aggregate([
        { $sort: { ratingsCount: -1 } },
        { $limit: 10 },
        {
            $project: {
                title: 1,
                genre: 1,
                ratingsAvg: 1,
                ratingsCount: 1
            }
        }
    ]);;

    await setCache(cacheKey, result, 300);
    return result;
};

exports.getGenres = async () => {

    const cacheKey = 'movies:genres';
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const genres = await Movie.distinct('genre');
    const result = genres.sort((first, second) => first.localeCompare(second));

    await setCache(cacheKey, result, 300);
    return result;
};
