const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/flowgen-test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
process.env.GROQ_API_KEY = "test-groq-key";
process.env.GEMINI_API_KEY = "test-gemini-key";

let receivedCourseId;
let receivedUserId;
const repositoryPath = require.resolve("../repository/course.repository");
const helperPath = require.resolve("../utils/helper");

require.cache[repositoryPath] = {
  id: repositoryPath,
  filename: repositoryPath,
  loaded: true,
  exports: {
    findCourseForUser: async (courseId, userId) => {
      receivedCourseId = courseId;
      receivedUserId = userId;
      return {
        modules: [{ moduleIndex: 1, lessons: [{ lessonIndex: 1, isCompleted: false }] }],
      };
    },
    findById: async () => null,
    saveCourseOutlineToDB: async () => null,
    findRecentCoursesByUser: async () => [],
    findLessonForUser: async () => null,
    checkLessonExistsForUser: async () => false,
    saveLesson: async () => null,
    saveHinglishContent: async () => null,
    searchVectorDB: async () => null,
    getLesson: async () => null,
    updateLessonStatus: async () => null,
    completeLessonForUser: async () => null,
  },
};

require.cache[helperPath] = {
  id: helperPath,
  filename: helperPath,
  loaded: true,
  exports: { addLessonToGenerationQueue: async () => null },
};

const { getCourseDetailsWithProgressService } = require("../services/course.service");

test("course details are loaded through an ownership-scoped repository query", async () => {
  const result = await getCourseDetailsWithProgressService("course-1", "user-1");

  assert.equal(receivedCourseId, "course-1");
  assert.equal(receivedUserId, "user-1");
  assert.equal(result.progress.currentModule, 1);
  assert.equal(result.progress.currentLesson, 1);
});
