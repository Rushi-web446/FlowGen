


require("dotenv").config();
const connectDB = require("../config/db");

// 🔴 CONNECT DB BEFORE WORKER STARTS
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
const { getYouTubeVideosService } = require("../services/youtube.service");
const { saveLessonService } = require("../services/course.service");

console.log("🟢 [BOOT] lesson.worker.js loaded");





const lessonWorker = new Worker(
  "LESSON_QUEUE",
  async (job) => {
    const { courseId, moduleIndex, lessonIndex, userId } = job.data;

    console.log("\n==============================");
    console.log(
      `🟡 [1] JOB STARTED | jobId=${job.id} | priority=${job.opts.priority}`,
    );
    console.log(
      "🟡 [2] Job payload:",
      { courseId, userId, moduleIndex, lessonIndex }
    );

    // ───────────────────────────────────────
    console.log("🟡 [3] Fetching lesson from DB (getLesson)");
    const existingLesson = await getLesson(courseId, moduleIndex, lessonIndex);
    // console.log(
    //   "🟢 [4] getLesson result:",
    //   existingLesson ? "FOUND" : "NOT FOUND",
    // );

    // ───────────────────────────────────────
    if (existingLesson && (existingLesson.isGenerated === "GENERATED" || existingLesson.isGenerated === "GENERATING")) {
      console.log(`🟣 Lesson status is ${existingLesson.isGenerated} → skipping`);
      return { skipped: true };
    }

    console.log("🟡 [6] Lesson not generated yet → setting status to GENERATING");
    await updateLessonStatus(courseId, moduleIndex, lessonIndex, "GENERATING");

    // ───────────────────────────────────────
    console.log("🟡 [7] Generating lesson prompt (getLessonPrompt)");
    const prompt = await getLessonPrompt(courseId, moduleIndex, lessonIndex);
    console.log(
      "🟢 [8] Prompt generated successfully (length:",
      prompt?.length,
      ")",
    );

    // ───────────────────────────────────────
    console.log("🟡 [9] Calling LLM (generateLessonService)");
    const lessonData = await generateLessonService(prompt);
    console.log("🟢 [10] LLM response received:", lessonData ? "OK" : "EMPTY");

    // ───────────────────────────────────────
    console.log("🟡 [11] Preparing YouTube search");
    let youtubeVideos = [];
    const query =
      lessonData?.videoQuery || `${lessonData?.title || "lesson"} tutorial`;

    console.log("🟡 [12] YouTube query:", query);

    try {
      console.log("🟡 [13] Fetching YouTube videos");
      youtubeVideos = await getYouTubeVideosService(query);
      console.log("🟢 [14] YouTube videos fetched:", youtubeVideos.length);
    } catch (err) {
      console.error(
        "🔴 [15] YouTube fetch FAILED (non-blocking):",
        err.message,
      );
    }

    lessonData.youtubeVideos = youtubeVideos;

    // ───────────────────────────────────────
    console.log("🟡 [16] Saving lesson data to DB (saveLessonService)");

    await saveLessonService(
      courseId,
      moduleIndex,
      lessonIndex,
      lessonData
    );

    console.log("🟢 [17] Lesson saved successfully");
    console.log("🟢 [17] Lesson saved successfully");

    // ───────────────────────────────────────
    // console.log("🟡 [18] Updating lesson status → GENERATED");
    // await updateLessonStatus({
    //   courseId,
    //   moduleIndex,
    //   lessonIndex,
    //   status: "GENERATED",
    //   content: lessonData,
    // });

    console.log("🟢 [19] Lesson status updated to GENERATED");

    // ───────────────────────────────────────
    console.log(`✅ [20] JOB COMPLETED SUCCESSFULLY | jobId=${job.id}`);
    console.log("==============================\n");

    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 1,
    lockDuration: 5 * 60 * 1000, // 5 minutes
  },
);












// ───────────────────────────────────────────
// Worker lifecycle events

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