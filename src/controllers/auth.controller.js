const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

exports.register = asyncHandler(async (req, res) => {

    const result = await authService.registerUser(req.body);

    res.status(201).json({
        success: true,
        result
    });

});

exports.login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    let result = await authService.login(email, password);

    res.status(200).json({
        success: true,
        result
    });

});
