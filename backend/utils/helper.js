const { lowPriorityLessonQueue } = require("../queues");
const Module = require("../models/module");

const addLessonToLowPriorityLessonQueue = async (courseId) => {

  // Get all modules of this course
  const modules = await Module.find({ course: courseId })
    .select("_id lessons")
    .lean();

  for (const module of modules) {
    for (const lessonId of module.lessons) {

      await lowPriorityLessonQueue.add(
        "GENERATE_LESSON",
        {
          courseId: courseId.toString(),
          moduleId: module._id.toString(),
          lessonId: lessonId.toString(),
        },
        {
          priority: 5,
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
        }
      );
    }
    // INTENTIONAL: Only queue Module 1 lessons for background pre-generation.
    // Queuing all modules at once hits GROQ free-tier rate limits.
    // Remaining modules are generated on-demand via the high-priority worker
    // when the user navigates to them.
    break;
  }
};

module.exports = { addLessonToLowPriorityLessonQueue };