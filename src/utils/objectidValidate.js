const mongoose = require("mongoose");

const objectIdValidator = (value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw { statusCode: 400, message: 'Invalid movie ID' };
    }
    return value;
};

module.exports = objectIdValidator;