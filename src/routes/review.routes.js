const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const validate = require("../middlewares/validate.middleware");
const { createReviewSchema, updateReviewSchema } = require("../validators/review.validation");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware")

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review for a movie
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - rating
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID of the movie being reviewed
 *                 example: 665f4c5e9c3d2a1a9c2b1234
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: Amazing movie with great visuals
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post("/", authMiddleware, roleMiddleware.isUser, validate(createReviewSchema), reviewController.createReview);



/**
 * @swagger
 * /reviews/my:
 *   get:
 *     summary: Get logged-in user's reviews
 *     description: Returns all reviews created by the authenticated user.
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User reviews fetched successfully
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.get('/my', authMiddleware, reviewController.getMyReviews);


/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     description: Allows a user to update their review by review ID.
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *           example: "6601b3a1e123456789abcd11"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             rating: 5
 *             comment: "Updated review comment"
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only user can update their review)
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authMiddleware, roleMiddleware.isUser, validate(updateReviewSchema), reviewController.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes a review by its ID. Only the review owner or authorized user can delete it.
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *           example: "6601b3a1e123456789abcd11"
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;