const { findById } = require("../repository/course.repository");
const { lessonQueue } = require("../queues");

const addLessonToLessonQueue = async (courseId, userId) => {
  const { updateLessonStatus, findById } = require("../repository/course.repository");
  const course = await findById(courseId);

  if (!course) {
    console.error(`Course with ID ${courseId} not found for lazy generation.`);
    return;
  }

  console.log("\n\n\n\n\n pusing into the low priority Queue \n\n\n");

  for (const currModule of course.modules) {
    for (const currLesson of currModule.lessons) {

      // ✅ Update status to PENDING before enqueuing
      await updateLessonStatus(courseId, currModule.moduleIndex, currLesson.lessonIndex, "PENDING");

      await lessonQueue.add(
        "GENERATE_LESSON",
        {
          courseId: courseId.toString(),
          moduleIndex: currModule.moduleIndex,
          lessonIndex: currLesson.lessonIndex,
          userId: userId?.toString(), // ✅ Ensure string
        },
        {
          // jobId: `lesson-${courseId.toString()}-${currModule.moduleIndex}-${currLesson.lessonIndex}`, // ❌ REMOVED to avoid collision with frontend high-priority jobs
          priority: 5,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        },
      );
    }
  }
};

module.exports = {
  addLessonToLessonQueue,
};