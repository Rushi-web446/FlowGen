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



    const generatedOutline = await generateOutlineService({ prompt });



    const courseId = await saveCourseOutlineToDBService(generatedOutline, userId);





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
