
const { getPool } = require("../Db/db");

exports.getAllProjects = async () => {
  const [rows] = await getPool().query(`
    SELECT p.*,
      (SELECT COUNT(*) FROM issues i
       WHERE i.projectId = p.id) AS issueCount
    FROM projects p
    ORDER BY p.id DESC
  `);

  return rows;
};

exports.createProject = async (name, projectKey, ownerId) => {
  const [result] = await getPool().execute(
    "INSERT INTO projects (name, projectKey, ownerId) VALUES (?, ?, ?)",
    [name, projectKey, ownerId]
  );

  return exports.getProjectById(result.insertId);
};

exports.getProjectById = async (id) => {
  const [rows] = await getPool().execute(
    "SELECT * FROM projects WHERE id = ?",
    [id]
  );

  return rows[0] || null;
};
