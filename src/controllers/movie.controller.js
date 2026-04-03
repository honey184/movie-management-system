const asyncHandler = require("../utils/asyncHandler");
const movieService = require("../services/movie.service");
const analyticsQueue = require("../queues/analytics.queue");



exports.createMovie = asyncHandler(async (req, res) => {

    const movie = await movieService.createMovie(req.body);

    res.status(201).json({
        success: true,
        data: movie
    });

});

exports.getMovies = asyncHandler(async (req, res) => {

    const movies = await movieService.getAllMovies(req.query);

    res.status(200).json({
        success: true,
        results: movies.length,
        data: movies
    });

});

exports.getMovieById = asyncHandler(async (req, res) => {

    const movie = await movieService.getMovieById(req.params.id);

    res.status(200).json({
        success: true,
        data: movie
    });

});

exports.searchMovies = asyncHandler(async (req, res) => {
    const data = await movieService.searchMovies(req.query);

    res.status(200).json({
        success: true,
        data
    });
});

exports.updateMovie = asyncHandler(async (req, res) => {

    const movie = await movieService.updateMovie(req.params.id, req.body);

    res.status(200).json({
        success: true,
        data: movie
    });

});

exports.deleteMovie = asyncHandler(async (req, res) => {

    await movieService.deleteMovie(req.params.id);

    await analyticsQueue.add();

    res.status(200).json({
        success: true,
        message: 'Movie deleted successfully'
    });

});

exports.getTopRated = asyncHandler(async (req, res) => {

    const movies = await movieService.getTopRated();

    res.status(200).json({
        success: true,
        data: movies
    });

});

exports.getMostReviewed = asyncHandler(async (req, res) => {

    const result = await movieService.getMostReviewed();

    res.status(200).json({
        success: true,
        data: result
    });

});

