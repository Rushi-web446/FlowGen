require("dotenv").config();



const connectDB = require("../config/db");
const { redisConnection } = require("../redis/connection");


// since this will not trigger through server.js file so we have to make sure write first hear
connectDB();




const { Worker } = require("bullmq");
const { generateOutlineService } = require("../services/course.generate.service");
const { saveCourseOutlineToDBService } = require("../services/course.service");
const { addLessonToLowPriorityLessonQueue } = require("../utils/helper");




const courseWorker = new Worker(
  "COURSE_QUEUE",
  async (job) => {
    const { prompt, userId } = job.data;


    const generatedOutline = await generateOutlineService({ prompt });


    const courseId = await saveCourseOutlineToDBService(generatedOutline, userId);

    await addLessonToLowPriorityLessonQueue(courseId);

    return { courseId };
  },
  {
    connection: redisConnection,
    concurrency: 1,
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
