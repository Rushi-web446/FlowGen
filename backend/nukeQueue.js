require("dotenv").config();

const { Queue } = require("bullmq");
const { redisConnection } = require("./redis/connection");

const queue = new Queue("LOW_PRIORITY_LESSON_QUEUE", {
  connection: redisConnection,
});

async function nuke() {
  await queue.obliterate({ force: true });
  console.log("QUEUE COMPLETELY DESTROYED");
  process.exit(0);
}

nuke();