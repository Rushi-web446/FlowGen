const IORedis = require("ioredis");
const env = require("../config/env");

const redisUrl = new URL(env.REDIS_URL);
const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("Redis error:", err.message);
});

module.exports = { redisConnection };
