const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Middleware Imports
const checkJwt = require('./middleware/auth.middleware');
const syncUser = require('./middleware/user.sync.middleware');

// Route Imports
const userRoutes = require("./routes/user.route");
const coursesRoute = require("./routes/course.route");

const app = express();

app.use(cors());
app.use(express.json());

const serverAdapter = require("./bullBoard");



connectDB();

app.use("/admin/queues", serverAdapter.getRouter());

// Health Check
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/course", coursesRoute); 

app.use("/user", checkJwt, syncUser, userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid Token" });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});