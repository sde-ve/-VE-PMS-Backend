const { getPool } = require("../Db/db");

const asText = (v) => (v === null || v === undefined || v === "" ? null : String(v).slice(0, 255));

exports.log = async (issueId, userId, field, oldValue, newValue) => {
  await getPool().execute(
    `INSERT INTO activity (issueId, userId, field, oldValue, newValue, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [issueId, userId, field, asText(oldValue), asText(newValue), new Date()]
  );
};

exports.getByIssue = async (issueId) => {
  const [rows] = await getPool().execute(
    `SELECT a.*, COALESCE(u.name, 'Unknown user') AS userName
     FROM activity a
     LEFT JOIN users u ON u.id = a.userId
     WHERE a.issueId = ?
     ORDER BY a.id DESC`,
    [issueId]
  );

  return rows;
};