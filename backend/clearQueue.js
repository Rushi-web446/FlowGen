require("dotenv").config();

const { Queue } = require("bullmq");
const { redisConnection } = require("./redis/connection");

const queue = new Queue("HIGH_PRIORITY_LESSON_QUEUE", {
  connection: redisConnection,
});

async function clear() {
  await queue.drain();
  await queue.clean(0, 1000, "completed");
  await queue.clean(0, 1000, "failed");
  console.log("Queue cleared successfully");
  process.exit(0);
}

clear();