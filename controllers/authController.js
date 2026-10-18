
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

const createToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({
      error: "Name, email and password (minimum 6 characters) are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    const user = await User.createUser(name.trim(), normalizedEmail, hash);

    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already registered" });
    }

    throw error;
  }
};

exports.login = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  const user = await User.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  res.json({ user: publicUser, token: createToken(publicUser) });
};
