const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authvalidator = require("../validators/auth.validation");
const authMiddleware = require('../middlewares/auth.middleware')

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account in the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 description: Must contain minimum 8 characters including uppercase, lowercase, number and special character
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *     
 *       400:
 *         description: Validation error or user already exists
 *       
 *       409:
 *         description: Conflict (duplicate email)
 *       500:
 *         description: Internal server error
 */

router.post("/register", validate(authvalidator.registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user or admin
 *     description: Authenticate user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *     
 *       400:
 *         description: Invalid credentials or validation error
 *         
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

router.post("/login", validate(authvalidator.loginSchema), authController.login);


module.exports = router;