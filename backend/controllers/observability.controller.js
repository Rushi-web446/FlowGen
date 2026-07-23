const mongoose = require("mongoose");
const { redisConnection } = require("../redis/connection");
const { lessonGenerationQueue, lessonGenerationDeadLetterQueue } = require("../queues");

const health = async (req, res) => {
  const [redis, queue] = await Promise.allSettled([redisConnection.ping(), lessonGenerationQueue.getJobCounts()]);
  const mongo = mongoose.connection.readyState === 1;
  const ok = mongo && redis.status === "fulfilled" && queue.status === "fulfilled";
  res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "degraded", requestId: req.id, checks: { mongo, redis: redis.status === "fulfilled", queue: queue.status === "fulfilled" } });
};
const metrics = async (req, res) => {
  const [jobs, dlq] = await Promise.all([lessonGenerationQueue.getJobCounts(), lessonGenerationDeadLetterQueue.getJobCounts()]);
  res.json({ requestId: req.id, queues: { lessonGeneration: jobs, deadLetter: dlq }, uptimeSeconds: process.uptime(), memory: process.memoryUsage() });
};
module.exports = { health, metrics };
