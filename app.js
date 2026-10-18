
// const express = require("express");

// const app = express();
// const PORT = 5000;

// app.use(express.json());

// // Test API
// app.get("/", (req, res) => {
//   res.send("Node.js backend is running!");
// });

// // Example API returning JSON
// app.get("/api/users", (req, res) => {
//   res.json([
//     { id: 1, name: "Manasi" },
//     { id: 2, name: "Rahul" },
//   ]);
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {initDb} = require('./Db/db')
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api", authMiddleware);

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", issueRoutes);

initDb()
  .then(() => {

    console.log(process.env.PORT,'jk');
    
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Database setup failed!");
    console.error("Error code:", e.code);
    console.error("Error message:", e.message);
    console.error("Full error:", e);
    process.exit(1);
  });