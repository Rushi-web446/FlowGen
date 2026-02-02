


require("dotenv").config();
const connectDB = require("../config/db");

connectDB();

setInterval(() => {
  redisConnection.ping();
}, 30_000);



const { Worker } = require("bullmq");
const { redisConnection } = require("../redis/connection");

const {
  getLesson,
  updateLessonStatus,
} = require("../repository/course.repository");


const { getLessonPrompt } = require("../Prompts/helper.prompt");



const {
  generateLessonService,
} = require("../services/course.generate.service");
const { getYouTubeVideosService } = require("../services/YouTube.service");
const { saveLessonService } = require("../services/course.service");






const lessonWorker = new Worker(
  "LESSON_QUEUE",
  async (job) => {
    const { courseId, moduleIndex, lessonIndex, userId } = job.data;



    const existingLesson = await getLesson(courseId, moduleIndex, lessonIndex);


    if (existingLesson && (existingLesson.isGenerated === "GENERATED" || existingLesson.isGenerated === "GENERATING")) {
      return { skipped: true };
    }

    await updateLessonStatus(courseId, moduleIndex, lessonIndex, "GENERATING");

    const prompt = await getLessonPrompt(courseId, moduleIndex, lessonIndex);


    const lessonData = await generateLessonService(prompt);

    let youtubeVideos = [];
    const query =
      lessonData?.videoQuery || `${lessonData?.title || "lesson"} tutorial`;


    try {
      youtubeVideos = await getYouTubeVideosService(query);
    } catch (err) {
      console.error(
        " YouTube fetch FAILED (non-blocking):",
        err.message,
      );
    }

    lessonData.youtubeVideos = youtubeVideos;


    await saveLessonService(
      courseId,
      moduleIndex,
      lessonIndex,
      lessonData
    );






    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 1,
    lockDuration: 5 * 60 * 1000, // 5 minutes
  },
);













lessonWorker.on("completed", (job) => {
  console.log(` [EVENT] Job completed | jobId=${job.id}`);
});

lessonWorker.on("failed", (job, err) => {
  console.error(` [EVENT] Job failed | jobId=${job?.id}`, err);
});

lessonWorker.on("error", (err) => {
  console.error(" [EVENT] Worker error:", err);
});

console.log(" [BOOT] Lesson worker is running");