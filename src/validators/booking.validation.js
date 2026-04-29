const Joi = require('../utils/joi');

const validateShowDate = (value, helpers) => {
    const selectedDate = new Date(value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return helpers.message('"Show Date" must be today or a future date');
    }

    return value;
};

const createBookingSchema = Joi.object({
    movie: Joi.string()
        .hex()
        .length(24)
        .required()
        .label('Movie'),
    
    showDate: Joi.date()
        .iso()
        .required()
        .custom(validateShowDate)
        .label('Show Date'),
    
    showTime: Joi.string()
        .required()
        .valid('10:00', '13:00', '16:00', '19:00', '22:00')
        .label('Show Time'),
    
    seats: Joi.number()
        .integer()
        .required()
        .min(1)
        .max(10)
        .label('Number of Seats')
});

module.exports = {
    createBookingSchema
};
