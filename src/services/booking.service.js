const Booking = require('../models/booking.model');
const Movie = require('../models/movie.model');
const objectIdValidator = require('../utils/objectidValidate');

const TICKET_PRICE = 150; // Base ticket price

exports.createBooking = async (userId, bookingData) => {
    const { movieId, showDate, showTime, seats } = bookingData;

    // Validate movie ID
    await objectIdValidator(movieId);

    // Check if movie exists
    const movie = await Movie.findById(movieId).select('title');
    if (!movie) throw { statusCode: 404, message: 'Movie not found' };

    // Validate show date (should be future date)
    const selectedDate = new Date(showDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        throw { statusCode: 400, message: 'Show date must be in the future' };
    }

    // Calculate total price
    const totalPrice = TICKET_PRICE * seats;

    // Create booking
    const booking = await Booking.create({
        user: userId,
        movie: movieId,
        showDate: selectedDate,
        showTime,
        seats,
        totalPrice
    });

    // Populate movie and user details
    await booking.populate('movie', 'title genre releaseYear');
    await booking.populate('user', 'name email');

    return booking;
};

exports.getUserBookings = async (userId) => {
    const bookings = await Booking.find({ user: userId })
        .populate('movie', 'title genre releaseYear ratingsAvg')
        .sort({ createdAt: -1 });

    return bookings;
};

exports.getBookingById = async (bookingId, userId) => {
    await objectIdValidator(bookingId);

    const booking = await Booking.findOne({ 
        _id: bookingId, 
        user: userId 
    })
        .populate('movie', 'title genre releaseYear ratingsAvg')
        .populate('user', 'name email');

    if (!booking) throw { statusCode: 404, message: 'Booking not found' };

    return booking;
};

exports.cancelBooking = async (bookingId, userId) => {
    await objectIdValidator(bookingId);

    const booking = await Booking.findOne({ 
        _id: bookingId, 
        user: userId 
    });

    if (!booking) throw { statusCode: 404, message: 'Booking not found' };

    if (booking.status === 'cancelled') {
        throw { statusCode: 400, message: 'Booking is already cancelled' };
    }

    booking.status = 'cancelled';
    await booking.save();

    await booking.populate('movie', 'title genre releaseYear');

    return booking;
};
