const { lessonGenerationQueue } = require("../queues");
const Module = require("../models/module");
const Lesson = require("../models/lesson");

/**
 * Add a single lesson to the generation queue
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {string} lessonId 
 */
const addLessonToGenerationQueue = async (courseId, moduleId, lessonId) => {
  // Task deduplication using jobId
  const jobId = `lesson-gen-${lessonId}`;
  
  // Check if lesson already exists and is generated
  const existingLesson = await Lesson.findById(lessonId).select("isGenerated");
  if (existingLesson && existingLesson.isGenerated === "GENERATED") {
    console.log(`[QUEUE] Lesson ${lessonId} already generated - skipping`);
    return;
  }

  // Add job to queue with deduplication
  await lessonGenerationQueue.add(
    "GENERATE_LESSON",
    {
      courseId: courseId.toString(),
      moduleId: moduleId.toString(),
      lessonId: lessonId.toString(),
    },
    {
      jobId, // Deduplication key
      priority: 10,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  );
  
  console.log(`[QUEUE] Added lesson ${lessonId} to generation queue`);
};

module.exports = { addLessonToGenerationQueue };