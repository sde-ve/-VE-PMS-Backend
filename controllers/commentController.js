const Issue = require("../models/issueModel");
const Comment = require("../models/commentModel");

async function issueOrNotFound(req, res) {
  const issue = await Issue.getIssueById(req.params.id);
  if (!issue) res.status(404).json({ error: "Issue not found" });
  return issue;
}

exports.getComments = async (req, res) => {
  if (!(await issueOrNotFound(req, res))) return;
  res.json(await Comment.getByIssue(req.params.id));
};

exports.createComment = async (req, res) => {
  if (!(await issueOrNotFound(req, res))) return;

  const body = String(req.body.body ?? "").trim();
  if (!body) return res.status(400).json({ error: "Comment cannot be empty" });
  if (body.length > 5000) return res.status(400).json({ error: "Comment is too long (max 5000 characters)" });

  const comment = await Comment.create({
    issueId: req.params.id,
    userId: req.userId,
    body,
  });

  res.status(201).json(comment);
};

exports.deleteComment = async (req, res) => {
  const comment = await Comment.getById(req.params.id);

  if (!comment) return res.status(404).json({ error: "Comment not found" });
  if (comment.userId !== req.userId) {
    return res.status(403).json({ error: "You can only delete your own comments" });
  }

  await Comment.remove(req.params.id);
  res.status(204).end();
};