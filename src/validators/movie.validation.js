const Joi = require("../utils/joi");

const createMovieSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .label("Title"),

    description: Joi.string()
        .allow("")
        .label("Description"),

    genre: Joi.array()
        .items(Joi.string().valid(
            'Action', 'Comedy', 'Drama', 'Horror',
            'Sci-Fi', 'Romance', 'Thriller', 'Animation',
            'Documentary', 'Adventure'
        ))
        .min(1)
        .required()
        .label("Genre"),

    releaseYear: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear())
        .required()
        .label("Release Year"),

    cast: Joi.array()
        .items(Joi.string())
        .label("Cast")
});

const updateMovieSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(1)
        .max(200)
        .optional()
        .label('Title'),

    description: Joi.string()
        .allow("")
        .label("Description"),

    genre: Joi.array()
        .items(Joi.string().valid(
            'Action', 'Comedy', 'Drama', 'Horror',
            'Sci-Fi', 'Romance', 'Thriller', 'Animation',
            'Documentary', 'Adventure'
        ))
        .min(1)
        .optional()
        .label("Genre"),

    cast: Joi.array()
        .items(Joi.string())
        .optional()
        .label("Cast"),

    releaseYear: Joi.number()
        .integer()
        .min(1900)
        .max(2026 + 1)
        .optional()
        .label("Release Year"),
}).min(1);

module.exports = {
    createMovieSchema,
    updateMovieSchema
};