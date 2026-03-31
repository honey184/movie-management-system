const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware")

router.use(authMiddleware);
/**
 * @swagger
 * /watchlist:
 *   post:
 *     summary: Add movie to watchlist
 *     tags: [Watchlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: 665c3d4f2f1b1b00123abcd1
 *     responses:
 *       200:
 *         description: Movie added to watchlist
 */

router.post("/", roleMiddleware.isUser, watchlistController.addToWatchlist);


/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     description: Retrieve the list of movies saved in the authenticated user's watchlist.
 *     tags:
 *       - Watchlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist fetched successfully
 *       401:
 *         description: Unauthorized (JWT token missing or invalid)
 */
router.get("/", authMiddleware, watchlistController.getWatchlist);

/**
 * @swagger
 * /watchlist/recommendations:
 *   get:
 *     summary: Get movie recommendations
 *     description: Returns movie recommendations based on the user's watchlist.
 *     tags:
 *       - Watchlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations fetched successfully
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.get('/recommendations', watchlistController.getRecommendations);

/**
 * @swagger
 * /watchlist/{movieId}:
 *   delete:
 *     summary: Remove a movie from watchlist
 *     description: Removes a specific movie from the user's watchlist using movie ID.
 *     tags:
 *       - Watchlist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         description: Movie ID to remove from watchlist
 *         schema:
 *           type: string
 *           example: "65f1a9e1234567890abcd123"
 *     responses:
 *       200:
 *         description: Movie removed from watchlist successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Movie not found in watchlist
 *       500:
 *         description: Internal server error
 */
router.delete('/:movieId', watchlistController.removeFromWatchlist);
/**
 * @swagger
 * /watchlist:
 *   delete:
 *     summary: Clear watchlist
 *     description: Removes all movies from the user's watchlist.
 *     tags:
 *       - Watchlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist cleared successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Watchlist cleared successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/', watchlistController.clearWatchlist);
module.exports = router;