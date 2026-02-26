const { findById } = require("../repository/course.repository");
const { lessonQueue } = require("../queues");

const addLessonToLessonQueue = async (courseId, userId) => {
  const { updateLessonStatus, findById } = require("../repository/course.repository");
  const course = await findById(courseId);

  if (!course) {
    console.error(`Course with ID ${courseId} not found for lazy generation.`);
    return;
  }


  for (const currModule of course.modules) {
    for (const currLesson of currModule.lessons) {

      await updateLessonStatus(courseId, currModule.moduleIndex, currLesson.lessonIndex, "PENDING");

      await lessonQueue.add(
        "GENERATE_LESSON",
        {
          courseId: courseId.toString(),
          moduleIndex: currModule.moduleIndex,
          lessonIndex: currLesson.lessonIndex,
          userId: userId?.toString(), 
        },
        {
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