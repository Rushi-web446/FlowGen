const { Redis } = require("ioredis");

const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  family: 4,                  // FORCE IPv4 only.
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