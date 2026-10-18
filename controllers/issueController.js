const Issue = require("../models/issueModel");
const Activity = require("../models/activityModel");

const STATUSES = ["todo", "in_progress", "in_review", "done"];
const PRIORITIES = ["low", "medium", "high"];
const TYPES = ["task", "bug", "story"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Fields that can be changed through PUT, and how each one is written to the activity log
const TRACKED = [
  { field: "title" },
  { field: "description", hide: true }, // log "updated the description" without storing the text
  { field: "status" },
  { field: "priority" },
  { field: "type" },
  { field: "assigneeId", show: (i) => i.assigneeName }, // log names, not ids
  { field: "dueDate" },
  { field: "storyPoints" },
  { field: "labels", read: (i) => (i.labels || []).join(", ") },
];
const EDITABLE = TRACKED.map((t) => t.field);

function normalizeLabels(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return [
    ...new Set(
      list.map((l) => String(l).replace(/,/g, "").trim().toLowerCase()).filter(Boolean)
    ),
  ];
}

// Turns form values ("" / undefined) into what the database expects (null / array / number)
function normalizeIssue(i) {
  const points = i.storyPoints;

  return {
    ...i,
    title: String(i.title ?? "").trim(),
    description: i.description ?? "",
    assigneeId: i.assigneeId || null,
    labels: normalizeLabels(i.labels),
    dueDate: i.dueDate || null,
    storyPoints: points === "" || points === null || points === undefined ? null : Number(points),
  };
}

function validateIssue(issue) {
  if (!issue.title) return "Title is required";
  if (!STATUSES.includes(issue.status)) return "Invalid status";
  if (!PRIORITIES.includes(issue.priority)) return "Invalid priority";
  if (!TYPES.includes(issue.type)) return "Invalid type";

  if (issue.dueDate && (!DATE_RE.test(issue.dueDate) || Number.isNaN(Date.parse(issue.dueDate)))) {
    return "Invalid due date";
  }
  if (
    issue.storyPoints !== null &&
    (!Number.isInteger(issue.storyPoints) || issue.storyPoints < 0 || issue.storyPoints > 100)
  ) {
    return "Story points must be a whole number from 0 to 100";
  }
  if (issue.labels.length > 10 || issue.labels.some((l) => l.length > 30)) {
    return "Use at most 10 labels, up to 30 characters each";
  }

  return null;
}

// Compare the issue before and after an update and write one activity row per changed field
async function logChanges(before, after, userId) {
  for (const t of TRACKED) {
    const read = t.read || ((i) => i[t.field]);
    if (String(read(before) ?? "") === String(read(after) ?? "")) continue;

    const show = t.hide ? () => null : t.show || read;
    await Activity.log(after.id, userId, t.field, show(before), show(after));
  }
}

exports.getProjectIssues = async (req, res) => {
  const issues = await Issue.getProjectIssues(req.params.id);
  res.json(issues);
};

exports.createIssue = async (req, res) => {
  const issue = normalizeIssue({
    projectId: req.params.id,
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "todo",
    priority: req.body.priority || "medium",
    type: req.body.type || "task",
    assigneeId: req.body.assigneeId,
    labels: req.body.labels,
    dueDate: req.body.dueDate,
    storyPoints: req.body.storyPoints,
    reporterId: req.userId,
  });

  const error = validateIssue(issue);
  if (error) return res.status(400).json({ error });

  const created = await Issue.createIssue(issue);
  await Activity.log(created.id, req.userId, "created", null, null);

  res.status(201).json(created);
};

exports.updateIssue = async (req, res) => {
  const existing = await Issue.getIssueById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Issue not found" });
  }

  // Only editable fields are taken from the body (dragging a card sends just { status })
  const merged = { ...existing };
  for (const f of EDITABLE) {
    if (f in req.body) merged[f] = req.body[f];
  }

  const issue = normalizeIssue(merged);
  const error = validateIssue(issue);

  if (error) return res.status(400).json({ error });

  const updated = await Issue.updateIssue(req.params.id, issue);

  try {
    await logChanges(existing, updated, req.userId);
  } catch (err) {
    console.error("Activity log failed:", err.message); // never fail the update because of the log
  }

  res.json(updated);
};

exports.deleteIssue = async (req, res) => {
  const deleted = await Issue.deleteIssue(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "Issue not found" });
  }

  res.status(204).end();
};