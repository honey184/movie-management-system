const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie.controller");
const validate = require("../middlewares/validate.middleware");
const movieValidation = require("../validators/movie.validation");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require('../middlewares/role.middleware')
const reviewController = require("../controllers/review.controller")

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - genre
 *               - releaseYear
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: A mind-bending sci-fi thriller
 *               genre:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example: ["Sci-Fi", "Thriller"]
 *               releaseYear:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2026
 *                 example: 2010
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post("/", authMiddleware, roleMiddleware.isAdmin, validate(movieValidation.createMovieSchema), movieController.createMovie);
/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve all movies with filtering, sorting, pagination, and field selection.
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of movies per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort movies by fields (prefix with - for descending)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Select specific fields to return
 *       - in: query
 *         name: ratingsAvg
 *         schema:
 *           type: number
 *         description: Filter movies with rating greater than or equal to value
 *
 *     responses:
 *
 *       200:
 *         description: Movies fetched successfully
 *
 *       400:
 *         description: Bad request (invalid query parameters)
 *
 *       401:
 *         description: Unauthorized (authentication required)
 *
 *       403:
 *         description: Forbidden (user does not have permission)
 *
 *       404:
 *         description: Movies not found
 *
 *       500:
 *         description: Internal server error
 *     
 */
router.get("/", movieController.getMovies);


/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Search movies
 *     description: Search movies by title, genre, or release year using a keyword
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Keyword used to search movies
 *         schema:
 *           type: string
 *           example: action
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *       
 *       400:
 *         description: Search keyword is required
 *       404:
 *         description: Movies not found
*
 *       500:
 *         description: Internal server error
 */
router.get("/search", movieController.searchMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     description: Retrieve details of a specific movie using its ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *           example: 665c3d4f2f1b1b00123abcd1
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
 *     
 *       400:
 *         description: Invalid movie ID
 *       
 *       404:
 *         description: Movie not found
 *      
 *       500:
 *         description: Internal server error
 */

router.get("/:id", movieController.getMovieById);

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     summary: Update movie details (Admin only)
 *     description: Update an existing movie by ID. Only admin users can perform this action.
 *     tags:
 *       - Movies
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to update
 *         schema:
 *           type: string
 *           example: 665f4e2b123abc4567890123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Inception
 *               genre:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example: ["Sci-Fi", "Thriller"]
 *               releaseYear:
 *                 type: integer
 *                 example: 2010
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (JWT token missing or invalid)
 *       403:
 *         description: Forbidden (Admin access required)
 *       404:
 *         description: Movie not found
 */
router.patch('/:id', authMiddleware, roleMiddleware.isAdmin, validate(movieValidation.updateMovieSchema), movieController.updateMovie);


/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie (Admin only)
 *     description: Deletes a movie from the database using its ID. Only admin users are allowed to perform this action.
 *     tags:
 *       - Movies
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to delete
 *         schema:
 *           type: string
 *           example: 665f4e2b123abc4567890123
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       401:
 *         description: Unauthorized (JWT token missing or invalid)
 *       403:
 *         description: Forbidden (Admin access required)
 *       404:
 *         description: Movie not found
 */
router.delete('/:id', authMiddleware, roleMiddleware.isAdmin, movieController.deleteMovie);

/**
 * @swagger
 * /movies/analytics/top-rated:
 *   get:
 *     summary: Get top rated movies
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of top rated movies
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/top-rated', movieController.getTopRated);

/**
 * @swagger
 * /movies/analytics/most-reviewed:
 *   get:
 *     summary: Get most reviewed movies
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of most reviewed movies
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/most-reviewed', movieController.getMostReviewed);


/**
 * @swagger
 * /movies/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a movie
 *     description: Retrieve reviews for a specific movie with pagination, filtering, and sorting
 *     tags: [Reviews]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of reviews per page
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: -createdAt
 *         description: Sort reviews by field (prefix with - for descending)
 *
 *
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *
 *       400:
 *         description: Invalid movie ID
 *
 *       404:
 *         description: Movie not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/:id/reviews", reviewController.getReviewsByMovie);

module.exports = router;