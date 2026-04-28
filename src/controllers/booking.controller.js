const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createBooking = asyncHandler(async (req, res) => {
    const { movieId, showDate, showTime, seats } = req.body;

    const bookingData = {
        movieId,
        showDate,
        showTime,
        seats: parseInt(seats)
    };

    const booking = await bookingService.createBooking(req.user._id, bookingData);

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
    });
});

exports.getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user._id);

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

exports.getBookingById = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await bookingService.getBookingById(bookingId, req.user._id);

    res.status(200).json({
        success: true,
        data: booking
    });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await bookingService.cancelBooking(bookingId, req.user._id);

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
    });
});
