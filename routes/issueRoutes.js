const express = require("express");
const router = express.Router();

const issueController = require("../controllers/issueController");
const commentController = require("../controllers/commentController");
const activityController = require("../controllers/activityController");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/projects/:id/issues
router.get(
  "/projects/:id/issues",
  asyncHandler(issueController.getProjectIssues)
);

// POST /api/projects/:id/issues
router.post(
  "/projects/:id/issues",
  asyncHandler(issueController.createIssue)
);

// PUT /api/issues/:id
router.put(
  "/issues/:id",
  asyncHandler(issueController.updateIssue)
);

// DELETE /api/issues/:id
router.delete(
  "/issues/:id",
  asyncHandler(issueController.deleteIssue)
);

// GET /api/issues/:id/comments
router.get(
  "/issues/:id/comments",
  asyncHandler(commentController.getComments)
);

// POST /api/issues/:id/comments
router.post(
  "/issues/:id/comments",
  asyncHandler(commentController.createComment)
);

// DELETE /api/comments/:id
router.delete(
  "/comments/:id",
  asyncHandler(commentController.deleteComment)
);

// GET /api/issues/:id/activity
router.get(
  "/issues/:id/activity",
  asyncHandler(activityController.getActivity)
);

module.exports = router;