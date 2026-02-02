const { Redis } = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  // family: 4,                  // FORCE IPv4 only.
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: () => true,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
});

redisConnection.on("connect", () => {
  console.log("Redis connected (Upstash)");
});

redisConnection.on("error", (err) => {
  console.error(" Redis error", err.message);
});

module.exports = { redisConnection };