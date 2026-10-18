
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/users
router.get("/", asyncHandler(userController.getUsers));

module.exports = router;
