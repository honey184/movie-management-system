const express = require('express');
const webController = require('../controllers/web.controller');

const router = express.Router();

router.get('/', webController.renderHome);
router.get('/analytics', webController.renderAnalytics);
router.get('/analytics/data', webController.getAnalyticsData);


router.get('/movies', webController.renderMovies);
router.get('/movies/:id', webController.renderMovieDetails);
router.get('/login', webController.renderLogin);
router.get('/register', webController.renderRegister);
router.get('/watchlist', webController.renderWatchlist);
router.get('/admin/movies', webController.renderAdminMovies);
router.get('/admin/movies/:id/edit', webController.renderAdminEditMovie);

module.exports = router;
