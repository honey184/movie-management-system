const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBookingSchema } = require('../validators/booking.validation');

// All booking routes require authentication
router.use(authMiddleware);
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - showDate
 *               - showTime
 *               - seats
 *               - totalPrice
 *             properties:
 *               movie:
 *                 type: string
 *                 description: Movie ID
 *                 example: "64f1c2a5e123456789abcd01"
 *               showDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-10"
 *               showTime:
 *                 type: string
 *                 enum: ["10:00", "13:00", "16:00", "19:00", "22:00"]
 *                 example: "19:00"
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 3
 *               totalPrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 750
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', validate(createBookingSchema), bookingController.createBooking);

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get all bookings of logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get('/my-bookings', bookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details fetched successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get('/:bookingId', bookingController.getBookingById);


/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Cannot cancel booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.patch('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router;
