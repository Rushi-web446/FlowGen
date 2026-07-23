require("dotenv").config();

const connectDB = require("../config/db");
const { redisConnection } = require("../redis/connection");
const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const {
  getLesson,
  updateLessonStatus,
  claimLessonGeneration,
} = require("../repository/course.repository");

const { getLessonPrompt } = require("../Prompts/helper.prompt");
const { generateLessonService } = require("../services/course.generate.service");
const { saveLessonService } = require("../services/course.service");
const { retrieveKnowledge } = require("../services/retrieval.service");
const { lessonGenerationDeadLetterQueue } = require("../queues");

// Connect to DB
connectDB();

// Circuit breaker state
let circuitBreakerState = "CLOSED"; // CLOSED, OPEN, HALF-OPEN
let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const OPEN_TIMEOUT_MS = 30000; // 30 seconds
let circuitOpenTime = null;

// Check circuit breaker state
const shouldProcessJob = () => {
  if (circuitBreakerState === "CLOSED") {
    return true;
  }

  if (circuitBreakerState === "OPEN") {
    if (Date.now() - circuitOpenTime >= OPEN_TIMEOUT_MS) {
      circuitBreakerState = "HALF-OPEN";
      return true; // Allow one job to test
    }
    return false;
  }

  // HALF-OPEN
  return true;
};

// Update circuit breaker on success
const onJobSuccess = () => {
  failureCount = 0;
  circuitBreakerState = "CLOSED";
  circuitOpenTime = null;
};

// Update circuit breaker on failure
const onJobFailure = () => {
  failureCount++;
  
  if (failureCount >= FAILURE_THRESHOLD) {
    circuitBreakerState = "OPEN";
    circuitOpenTime = Date.now();
    console.error("[CIRCUIT BREAKER] Circuit is OPEN due to high failure rate");
  }
};

// Main worker
const lessonGenerationWorker = new Worker(
  "LESSON_GENERATION_QUEUE",
  async (job) => {
    // Check circuit breaker
    if (!shouldProcessJob()) {
      throw new Error("Circuit breaker is open");
    }

    const { courseId, moduleId, lessonId } = job.data;
    const startTime = Date.now();

    console.log(`[WORKER] Processing lesson generation job | jobId=${job.id} | lessonId=${lessonId}`);

    try {
      await job.updateProgress({ stage: "validating", percent: 10 });
      // Input validation
      if (!courseId || !moduleId || !lessonId) {
        throw new Error("Missing required fields in job data");
      }

      // Check if lesson is already generated
      const existingLesson = await getLesson(lessonId);
      if (existingLesson && existingLesson.isGenerated === "GENERATED") {
        console.log(`[WORKER] Lesson ${lessonId} already generated - skipping`);
        return { success: true, skipped: true, lessonId, lesson: { _id: existingLesson._id, title: existingLesson.title, description: existingLesson.briefDescription, content: existingLesson.content, resources: existingLesson.resources, retrievalCitations: existingLesson.retrievalCitations, isCompleted: existingLesson.isCompleted } };
      }

      // Atomically claim the lesson so duplicate jobs never generate twice.
      const claimedLesson = await claimLessonGeneration(lessonId);
      if (!claimedLesson) {
        console.log(`[WORKER] Lesson ${lessonId} is already being generated - skipping`);
        return { skipped: true, lessonId };
      }

      // Generate lesson content
      const prompt = await getLessonPrompt(courseId, moduleId, lessonId);
      await job.updateProgress({ stage: "generating", percent: 35 });
      const retrieval = await retrieveKnowledge({ query: `${prompt.title} ${prompt.briefDescription}`, userId: null });
      const lessonData = await generateLessonService({
        ...prompt,
        resources: [...(prompt.resources || []), ...retrieval.citations.filter((citation) => citation.url).map((citation) => ({ title: citation.title, type: "reference", url: citation.url }))],
      });

      // Save the lesson
      await saveLessonService(moduleId, lessonId, { ...lessonData, retrievalCitations: retrieval.citations });
      await job.updateProgress({ stage: "completed", percent: 100 });

      // Success metrics
      const processingTime = Date.now() - startTime;
      console.log(
        `[WORKER] Lesson generation completed | lessonId=${lessonId} | processingTime=${processingTime}ms`
      );

      onJobSuccess();

      return {
        success: true, lessonId, processingTime,
        lesson: { ...lessonData, _id: lessonId, title: claimedLesson.title, description: claimedLesson.briefDescription, resources: claimedLesson.resources },
      };
    } catch (error) {
      onJobFailure();
      
      console.error(
        `[WORKER] Lesson generation failed | jobId=${job.id} | lessonId=${lessonId}`,
        {
          timestamp: new Date().toISOString(),
          courseId,
          moduleId,
          lessonId,
          error: error.message,
          stack: error.stack,
        }
      );

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    lockDuration: 10 * 60 * 1000, // 10 minutes
  }
);

// Event listeners
lessonGenerationWorker.on("completed", (job) => {
  console.log(`[EVENT] Job completed successfully | jobId=${job.id}`);
});

lessonGenerationWorker.on("failed", async (job, err) => {
  console.error(`[EVENT] Job failed | jobId=${job?.id}`, err);

  // Move to dead letter queue if all attempts exhausted
  if (job && job.attemptsMade >= job.opts.attempts) {
    try {
      await updateLessonStatus(job.data.lessonId, "FAILED");
      await lessonGenerationDeadLetterQueue.add("FAILED_LESSON_GEN", job.data, {
        jobId: `dlq-${job.id}`,
        prevJobId: job.id,
        failedAt: new Date().toISOString(),
        error: {
          message: err.message,
          stack: err.stack,
        },
      });
      console.log(`[EVENT] Moved failed job ${job.id} to DLQ`);
    } catch (dlqError) {
      console.error("[EVENT] Failed to move job to DLQ:", dlqError);
    }
  }
});

lessonGenerationWorker.on("error", (err) => {
  console.error("[EVENT] Worker error:", err);
});

// Monitoring metrics
const monitorQueue = async () => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      lessonGenerationWorker.getWaitingCount(),
      lessonGenerationWorker.getActiveCount(),
      lessonGenerationWorker.getCompletedCount(),
      lessonGenerationWorker.getFailedCount(),
    ]);

    console.log(
      `[MONITOR] Queue status | waiting=${waiting} | active=${active} | completed=${completed} | failed=${failed} | circuit=${circuitBreakerState}`
    );
  } catch (error) {
    console.error("[MONITOR] Error fetching queue metrics:", error);
  }
};

// Monitor queue every 30 seconds
setInterval(monitorQueue, 30000);

console.log("[BOOT] Lesson generation worker is running");
