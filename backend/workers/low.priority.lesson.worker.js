require("dotenv").config();

const connectDB = require("../config/db");
const { redisConnection } = require("../redis/connection");
const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const {
  getLesson,
  updateLessonStatus,
  saveLesson,
} = require("../repository/course.repository");

const { getLessonPrompt } = require("../Prompts/helper.prompt");
const { generateLessonService } = require("../services/course.generate.service");
const { saveLessonService } = require("../services/course.service");


connectDB();







const lowPriorityLessonWorker = new Worker(
  "LOW_PRIORITY_LESSON_QUEUE",
  async (job) => {
    const { courseId, moduleId, lessonId } = job.data;

    console.log("JOB DATA:", job.data);


    try {
      const existingLesson = await getLesson(moduleId, lessonId);

      if (
        existingLesson &&
        existingLesson.isGenerated === "GENERATED"
      ) {
        console.log("[WORKER] Lesson already processed. Skipping.");
        return { skipped: true };
      }

      await updateLessonStatus(moduleId, lessonId, "GENERATING");

      const prompt = await getLessonPrompt(courseId, moduleId, lessonId);
      if (!prompt) throw new Error("Prompt generation failed");

      const lessonData = await generateLessonService(prompt);
      if (!lessonData) throw new Error("Lesson generation failed");

      await saveLessonService(moduleId, lessonId, lessonData);

      console.log("[WORKER] Lesson saved successfully");
      return { success: true };
    } catch (error) {
      console.error("[WORKER ERROR]", error.message);
      await updateLessonStatus(moduleId, lessonId, "FAILED");
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    lockDuration: 5 * 60 * 1000,
    limiter: {
      max: 1,
      duration: 10000, // 1 job per 10 seconds
    },

  }
);

lowPriorityLessonWorker.on("completed", (job) => {
  console.log(`Job completed | ${job.id}`);
});

lowPriorityLessonWorker.on("failed", (job, err) => {
  console.error(`Job failed | ${job?.id}`, err);
});

console.log("[BOOT] Low priority lesson worker running");