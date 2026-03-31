const JoiBase = require("joi");

const Joi = JoiBase.defaults(schema =>
    schema.options({
        abortEarly: false,
        messages: {
            "any.required": "{{#label}} is required",
            "string.empty": "{{#label}} cannot be empty",
            "string.base": "{{#label}} must be a string",
            "number.base": "{{#label}} must be a number",
            "number.min": "{{#label}} must be greater than or equal to {{#limit}}",
            "number.max": "{{#label}} must be less than or equal to {{#limit}}",
            "string.pattern.base": "{{#label}} must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        }
    })
);

module.exports = Joi;