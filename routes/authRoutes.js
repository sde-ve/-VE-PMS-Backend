
const express = require("express");
const router = express.Router();

const authController = require('../controllers/authController')
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/auth/register
router.post("/register", asyncHandler(authController.register));

// POST /api/auth/login
router.post("/login", asyncHandler(authController.login));

module.exports = router;
