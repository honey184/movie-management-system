const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");


exports.registerUser = async (data) => {

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create(data);

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};


exports.login = async (email, password) => {

    let account = await User.findOne({ email });

    if (!account) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await account.comparePassword(password);

    if (!isMatch) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({
        id: account._id,
        role: account.role
    });

    return { token };
};