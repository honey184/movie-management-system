const movieService = require('../services/movie.service');
const reviewService = require('../services/review.service');

const buildPageMeta = (title, currentPath) => ({
    pageTitle: title,
    currentPath,
});

exports.renderHome = async (req, res, next) => {
    try {
        const [latestMoviesData, genres] = await Promise.all([
            movieService.getAllMovies({ limit: 9, sort: '-releaseYear' }),
            movieService.getGenres(),
        ]);

        res.render('pages/home', {
            ...buildPageMeta('MovieHub Home', req.path),
            latestMovies: latestMoviesData.movies || [],
            genres: genres || [],
        });
    } catch (error) {
        next(error);
    }
};

exports.renderAnalytics = (req, res) => {
    res.render('pages/analytics', buildPageMeta('Movie Analytics', req.path));
};

exports.getAnalyticsData = async (req, res, next) => {
    try {
        const [topRated, mostReviewed] = await Promise.all([
            movieService.getTopRated(),
            movieService.getMostReviewed(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                topRated,
                mostReviewed,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfileData = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        }
    });
};

exports.renderMovies = async (req, res, next) => {
    try {
        const query = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
        };

        if (req.query.genre) query.genre = req.query.genre;
        if (req.query.releaseYear) query.releaseYear = req.query.releaseYear;
        if (req.query.sort) query.sort = req.query.sort;

        const data = req.query.q
            ? await movieService.searchMovies({ ...query, q: req.query.q })
            : await movieService.getAllMovies(query);

        const movies = data.movies || [];
        const pagination = {
            page: data.page || Number(req.query.page) || 1,
            limit: data.limit || Number(req.query.limit) || 10,
            hasPrev: (data.page || 1) > 1,
            hasNext: (data.page * data.limit) < data.total
        };

        res.render('pages/movies', {
            ...buildPageMeta('Browse Movies', req.path),
            movies,
            data,
            filters: {
                q: req.query.q || '',
                genre: req.query.genre || '',
                releaseYear: req.query.releaseYear || '',
                sort: req.query.sort || '',
                limit: pagination.limit,
            },
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

exports.renderMovieDetails = async (req, res, next) => {
    try {
        const [movie, reviewsData] = await Promise.all([
            movieService.getMovieById(req.params.id),
            reviewService.getMovieReviews(req.params.id, { page: 1, limit: 5 }),
        ]);

        res.render('pages/movie-details', {
            ...buildPageMeta(`${movie.title} Details`, req.path),
            movie,
            reviews: reviewsData.reviews || [],
            reviewCount: reviewsData.total || 0,
        });
    } catch (error) {
        next(error);
    }
};

exports.renderLogin = (req, res) => {
    res.render('pages/login', buildPageMeta('Login', req.path));
};

exports.renderRegister = (req, res) => {
    res.render('pages/register', buildPageMeta('Register', req.path));
};

exports.renderWatchlist = (req, res) => {
    res.render('pages/watchlist', buildPageMeta('My Watchlist', req.path));
};

exports.renderAdminMovies = async (req, res, next) => {
    try {
        const query = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: req.query.sort || '-releaseYear',
        };

        if (req.query.releaseYear) query.releaseYear = req.query.releaseYear;

        const moviesData = req.query.q
            ? await movieService.searchMovies({ ...query, q: req.query.q })
            : await movieService.getAllMovies(query);

        const pagination = {
            page: moviesData.page || Number(req.query.page) || 1,
            limit: moviesData.limit || Number(req.query.limit) || 10,
            hasPrev: (moviesData.page || 1) > 1,
            hasNext: (moviesData.page * moviesData.limit) < moviesData.total,
        };

        res.render('pages/admin-movies', {
            ...buildPageMeta('Admin Movie Manager', req.path),
            movies: moviesData.movies || [],
            data: moviesData,
            filters: {
                q: req.query.q || '',
                releaseYear: req.query.releaseYear || '',
                sort: req.query.sort || '-releaseYear',
                limit: pagination.limit,
            },
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

exports.renderAdminEditMovie = async (req, res, next) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);

        res.render('pages/admin-edit-movie', {
            ...buildPageMeta(`Edit ${movie.title}`, req.path),
            movie,
        });
    } catch (error) {
        next(error);
    }
};

exports.renderBookings = (req, res) => {
    res.render('pages/bookings', buildPageMeta('My Bookings', req.path));
};
