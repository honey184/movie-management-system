const Joi = require('../utils/joi');

const createBookingSchema = Joi.object({
    movieId: Joi.string()
        .required()
        .label('Movie ID'),
    
    showDate: Joi.date()
        .required()
        .min('now')
        .label('Show Date'),
    
    showTime: Joi.string()
        .required()
        .valid('10:00', '13:00', '16:00', '19:00', '22:00')
        .label('Show Time'),
    
    seats: Joi.number()
        .required()
        .min(1)
        .max(10)
        .label('Number of Seats')
});

module.exports = {
    createBookingSchema
};
