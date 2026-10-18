const { getPool } = require("../Db/db");

const COMMENT_SQL = `
  SELECT c.*, COALESCE(u.name, 'Unknown user') AS userName
  FROM comments c
  LEFT JOIN users u ON u.id = c.userId
`;

exports.getByIssue = async (issueId) => {
  const [rows] = await getPool().execute(
    `${COMMENT_SQL} WHERE c.issueId = ? ORDER BY c.id ASC`,
    [issueId]
  );

  return rows;
};

exports.getById = async (id) => {
  const [rows] = await getPool().execute(`${COMMENT_SQL} WHERE c.id = ?`, [id]);
  return rows[0] || null;
};

exports.create = async ({ issueId, userId, body }) => {
  const [result] = await getPool().execute(
    "INSERT INTO comments (issueId, userId, body, createdAt) VALUES (?, ?, ?, ?)",
    [issueId, userId, body, new Date()]
  );

  return exports.getById(result.insertId);
};

exports.remove = async (id) => {
  const [result] = await getPool().execute("DELETE FROM comments WHERE id = ?", [id]);
  return result.affectedRows > 0;
};