
const { getPool } = require("../Db/db");

exports.createUser = async (name, email, passwordHash) => {
  const [result] = await getPool().execute(
    "INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};

exports.findByEmail = async (email) => {
  const [rows] = await getPool().execute(
    "SELECT id, name, email, passwordHash FROM users WHERE email = ?",
    [email]
  );

  return rows[0] || null;
};

exports.getAllUsers = async () => {
  const [rows] = await getPool().query(
    "SELECT id, name, email FROM users ORDER BY name"
  );

  return rows;
};
