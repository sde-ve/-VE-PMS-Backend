
const express = require("express");
const router = express.Router();

const projectController = require('../controllers/projectController')
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/projects
router.get("/", asyncHandler(projectController.getProjects));

// POST /api/projects
router.post("/create-project", asyncHandler(projectController.createProject));

// GET /api/projects/:id
router.get("/:id", asyncHandler(projectController.getProjectById));

module.exports = router;
