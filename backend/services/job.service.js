const { QueueEvents } = require("bullmq");
const { lessonGenerationQueue } = require("../queues");
const { redisConnection } = require("../redis/connection");

const queueEvents = new QueueEvents("LESSON_GENERATION_QUEUE", { connection: redisConnection });
const enqueueLessonGeneration = async ({ courseId, moduleId, lessonId, idempotencyKey }) => {
  const jobId = `lesson:${lessonId}:${idempotencyKey || "default"}`;
  const existing = await lessonGenerationQueue.getJob(jobId);
  if (existing) return { job: existing, reused: true };
  const job = await lessonGenerationQueue.add("GENERATE_LESSON", { courseId, moduleId, lessonId }, { jobId, attempts: 3, backoff: { type: "exponential", delay: 5000 } });
  return { job, reused: false };
};
const getJobStatus = async (jobId) => {
  const job = await lessonGenerationQueue.getJob(jobId);
  if (!job) return null;
  return { id: job.id, state: await job.getState(), progress: job.progress || { stage: "queued" }, failedReason: job.failedReason || null, result: job.returnvalue || null };
};
module.exports = { enqueueLessonGeneration, getJobStatus, queueEvents };
