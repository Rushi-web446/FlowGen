const { Queue } = require("bullmq");
const { redisConnection } = require("../redis/connection.js");

const courseQueue = new Queue("COURSE_QUEUE", {
  connection: redisConnection,
});

const lowPriorityLessonQueue = new Queue("LOW_PRIORITY_LESSON_QUEUE", {
  connection: redisConnection,
});

const highPriorityLessonQueue = new Queue("HIGH_PRIORITY_LESSON_QUEUE", {
  connection: redisConnection,
});



module.exports = {
  courseQueue,
  lowPriorityLessonQueue,
  highPriorityLessonQueue,
};