require("dotenv").config();
const connectDB = require("../config/db");

// 🔴 CONNECT DB BEFORE WORKER STARTS
connectDB();

setInterval(() => {
  redisConnection.ping();
}, 30_000);



const { Worker } = require("bullmq");
const { redisConnection } = require("../redis/connection");
const { generateOutlineService } = require("../services/course.generate.service");
const { saveCourseOutlineToDBService } = require("../services/course.service");
const { addLessonToLessonQueue } = require("../utils/helper");

const courseWorker = new Worker(
  "COURSE_QUEUE",
  async (job) => {
    const { prompt, userId } = job.data;

    console.log("\n\n\n from worker/course.worker.js : \n\n printing prompt : \n\n", prompt, "\n\n");

    console.log("Processing course job:", job.id);

    const generatedOutline = await generateOutlineService({ prompt });

    console.log("\n\n\n from worker/course.worker.js printing generated outline : \n\n\n", generatedOutline, "\n\n\n\n");


    const courseId = await saveCourseOutlineToDBService(generatedOutline, userId);

    console.log("\n\n\n from worker/course.worker.js printing generated courseId : \n\n\n", courseId, "\n\n\n\n");




    await addLessonToLessonQueue(courseId, userId);

    return { courseId };
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);



courseWorker.on("completed", (job) => {
  console.log(`Course job ${job.id} completed`);
});

courseWorker.on("failed", (job, err) => {
  console.error(`Course job ${job.id} failed`, err);
});

module.exports = {
  courseWorker,
};
