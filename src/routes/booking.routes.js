const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBookingSchema } = require('../validators/booking.validation');

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post('/', validate(createBookingSchema), bookingController.createBooking);

// Get all user's bookings
router.get('/my-bookings', bookingController.getMyBookings);

// Get specific booking by ID
router.get('/:bookingId', bookingController.getBookingById);

// Cancel a booking
router.patch('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router;
