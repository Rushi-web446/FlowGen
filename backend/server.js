const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
require("dotenv").config();
const env = require("./config/env");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/error-handler");

const checkJwt = require('./middleware/auth.middleware');
const syncUser = require('./middleware/user.sync.middleware');

const userRoutes = require("./routes/user.route");
const coursesRoute = require("./routes/course.route");
const authRoutes = require("./routes/auth.route");
const queueRoutes = require("./routes/queue.route");
const learningRoutes = require("./routes/learning.route");
const { health, metrics } = require("./controllers/observability.controller");

if (env.START_WORKER !== "false") {
  require("./workers/lesson.generation.worker");
}



const app = express();

const allowedOrigins = (env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(pinoHttp({ logger, genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID() }));
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
}));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/course/generate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false }));

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/auth", authRoutes);
app.use("/course", coursesRoute);
app.use("/user", checkJwt, syncUser, userRoutes);
app.use("/queue", checkJwt, queueRoutes);
app.use("/learning", learningRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/health", health);
app.get("/metrics", checkJwt, metrics);
