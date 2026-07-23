const TutorMessage = require("../models/tutor-message");
const { findCourseForUser, findLessonForUser } = require("../repository/course.repository");
const { retrieveKnowledge } = require("./retrieval.service");
const { generateTutorResponse } = require("./course.generate.service");

const askTutor = async ({ userId, courseId, moduleId, lessonId, message }) => {
  const [course, lesson] = await Promise.all([
    findCourseForUser(courseId, userId),
    findLessonForUser({ moduleId, lessonId, userId }),
  ]);
  if (!course || !lesson) throw new Error("Lesson not found");

  const retrieval = await retrieveKnowledge({ query: `${lesson.title} ${message}`, userId });
  const history = await TutorMessage.find({ userId, courseId, lessonId }).sort({ createdAt: -1 }).limit(6).lean();
  await TutorMessage.create({ userId, courseId, lessonId, role: "user", content: message });
  const response = await generateTutorResponse({ course, lesson, message, history: history.reverse(), retrieval });
  const saved = await TutorMessage.create({
    userId, courseId, lessonId, role: "assistant", content: response.answer,
    citations: retrieval.citations, followUpQuiz: response.followUpQuiz || null,
  });
  return { message: saved, citations: retrieval.citations };
};

module.exports = { askTutor };
