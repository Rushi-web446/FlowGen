const { Queue } = require("bullmq");
const { redisConnection } = require("../redis/connection.js");

// Lesson generation queue (on-demand)
const lessonGenerationQueue = new Queue("LESSON_GENERATION_QUEUE", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// Dead letter queue for failed jobs
const lessonGenerationDeadLetterQueue = new Queue("LESSON_GENERATION_DLQ", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false,
  },
});

module.exports = {
  lessonGenerationQueue,
  lessonGenerationDeadLetterQueue,
};