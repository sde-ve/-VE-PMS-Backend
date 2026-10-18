const Issue = require("../models/issueModel");
const Activity = require("../models/activityModel");

// GET /api/issues/:id/activity
exports.getActivity = async (req, res) => {
  const issue = await Issue.getIssueById(req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  res.json(await Activity.getByIssue(req.params.id));
};