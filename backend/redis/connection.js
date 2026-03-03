const IORedis = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL not found");
}

const redisConnection = new IORedis(process.env.REDIS_URL, {
  tls: {},
  family: 4,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  keepAlive: 30000,

  retryStrategy(times) {
    return Math.min(times * 500, 3000);
  },
});

redisConnection.on("connect", () => {
  console.log("Redis connected (Upstash)");
});

redisConnection.on("error", (err) => {
  console.error("Redis error:", err.message);
});

module.exports = { redisConnection };