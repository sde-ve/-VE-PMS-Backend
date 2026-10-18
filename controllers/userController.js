
const User = require("../models/userModel");

exports.getUsers = async (req, res) => {
  const users = await User.getAllUsers();
  res.json(users);
};
