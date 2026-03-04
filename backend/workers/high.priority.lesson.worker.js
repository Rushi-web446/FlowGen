require("dotenv").config();



const connectDB = require("../config/db");
const { redisConnection } = require("../redis/connection");


// since this will not trigger through server.js file so we have to make sure write first hear
connectDB();




const { Worker } = require("bullmq");

const {
  getLesson,
  updateLessonStatus,
} = require("../repository/course.repository");


const { getLessonPrompt } = require("../Prompts/helper.prompt");



const {
  generateLessonService,
} = require("../services/course.generate.service");
const { saveLessonService } = require("../services/course.service");









const highPriorityLessonWorker = new Worker(
  "HIGH_PRIORITY_LESSON_QUEUE",
  async (job) => {
    const { courseId, moduleId, lessonId } = job.data;

    console.log("JOB DATA:", job.data);


    try {
      const existingLesson = await getLesson(moduleId, lessonId);

      if (
        existingLesson &&
        existingLesson.isGenerated === "GENERATED"
      ) {
        return { skipped: true };
      }

      await updateLessonStatus(moduleId, lessonId, "GENERATING");

      const prompt = await getLessonPrompt(courseId, moduleId, lessonId);
      const lessonData = await generateLessonService(prompt);

      await saveLessonService(moduleId, lessonId, lessonData);

      return { success: true };
    } catch (error) {
      await updateLessonStatus(moduleId, lessonId, "FAILED");
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    lockDuration: 5 * 60 * 1000,
  }
);





highPriorityLessonWorker.on("completed", (job) => {
  console.log(` [EVENT] Job completed | jobId=${job.id}`);
});

highPriorityLessonWorker.on("failed", (job, err) => {
  console.error(` [EVENT] Job failed | jobId=${job?.id}`, err);
});

highPriorityLessonWorker.on("error", (err) => {
  console.error(" [EVENT] Worker error:", err);
});

console.log(" [BOOT] High priority lesson worker is running");