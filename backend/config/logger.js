const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: [
    "req.headers.authorization",
    "req.body.password",
    "req.body.token",
    "authorization",
    "password",
    "token",
  ],
});

module.exports = logger;
