const Joi = require('../utils/joi');

const createReviewSchema = Joi.object({
    movieId: Joi.string()
        .required()
        .label("Movie ID"),

    rating: Joi.number()
        .min(1)
        .max(5)
        .required()
        .label("Rating"),

    comment: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .label("Comment")
});

const updateReviewSchema = Joi.object({
    rating: Joi.number()
        .min(1)
        .max(5)
        .optional(),

    comment: Joi.string()
        .trim()
        .max(500)
        .optional(),

}).min(1);

module.exports = {
    createReviewSchema,
    updateReviewSchema
};