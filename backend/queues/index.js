const { Queue } = require("bullmq");
const { redisConnection } = require("../redis/connection.js");

const courseQueue = new Queue("COURSE_QUEUE", {
  connection: redisConnection,
});

const lessonQueue = new Queue("LESSON_QUEUE", {
  connection: redisConnection,
});

module.exports = {
  courseQueue,
  lessonQueue,
};