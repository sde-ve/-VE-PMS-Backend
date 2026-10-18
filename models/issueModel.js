const { getPool } = require("../Db/db");

// DATE_FORMAT keeps dueDate as "YYYY-MM-DD" (a plain DATE would be sent as a JS Date and can shift a day by timezone)
const ISSUE_SQL = `
  SELECT i.*,
         DATE_FORMAT(i.dueDate, '%Y-%m-%d') AS dueDate,
         u.name AS assigneeName,
         r.name AS reporterName,
         (SELECT COUNT(*) FROM comments c WHERE c.issueId = i.id) AS commentCount
  FROM issues i
  LEFT JOIN users u ON u.id = i.assigneeId
  LEFT JOIN users r ON r.id = i.reporterId
`;

// labels are stored as "a,b" and sent to the client as an array
const toIssue = (row) =>
  row ? { ...row, labels: row.labels ? row.labels.split(",") : [] } : null;

exports.getProjectIssues = async (projectId) => {
  const [rows] = await getPool().execute(
    `${ISSUE_SQL} WHERE i.projectId = ? ORDER BY i.id DESC`,
    [projectId]
  );

  return rows.map(toIssue);
};

exports.getIssueById = async (id) => {
  const [rows] = await getPool().execute(
    `${ISSUE_SQL} WHERE i.id = ?`,
    [id]
  );

  return toIssue(rows[0]);
};

exports.createIssue = async (issue) => {
  const [result] = await getPool().execute(
    `INSERT INTO issues
      (projectId, title, description, status, priority, type,
       assigneeId, reporterId, labels, dueDate, storyPoints)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      issue.projectId,
      issue.title,
      issue.description,
      issue.status,
      issue.priority,
      issue.type,
      issue.assigneeId,
      issue.reporterId,
      issue.labels.join(","),
      issue.dueDate,
      issue.storyPoints,
    ]
  );

  return exports.getIssueById(result.insertId);
};

exports.updateIssue = async (id, issue) => {
  await getPool().execute(
    `UPDATE issues
     SET title = ?, description = ?, status = ?,
         priority = ?, type = ?, assigneeId = ?,
         labels = ?, dueDate = ?, storyPoints = ?
     WHERE id = ?`,
    [
      issue.title,
      issue.description,
      issue.status,
      issue.priority,
      issue.type,
      issue.assigneeId,
      issue.labels.join(","),
      issue.dueDate,
      issue.storyPoints,
      id,
    ]
  );

  return exports.getIssueById(id);
};

// Also removes the issue's comments and activity, all or nothing
exports.deleteIssue = async (id) => {
  const conn = await getPool().getConnection();

  try {
    await conn.beginTransaction();
    await conn.execute("DELETE FROM comments WHERE issueId = ?", [id]);
    await conn.execute("DELETE FROM activity WHERE issueId = ?", [id]);
    const [result] = await conn.execute("DELETE FROM issues WHERE id = ?", [id]);
    await conn.commit();

    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};