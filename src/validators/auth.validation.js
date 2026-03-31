const Joi = require("../utils/joi");

const registerSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .label("Name"),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] }, })
        .required()
        .label("Email"),

    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .min(6)
        .max(30)
        .required()
        .label("Password")
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] }, })
        .required()
        .label("Email"),

    password: Joi.string()
        .required()
        .label("Password")
});

module.exports = {
    registerSchema,
    loginSchema
};