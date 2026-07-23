const Course = require("../models/course");
const Module = require("../models/module");
const Lesson = require("../models/lesson");
const mongoose = require("mongoose");

const findCourseById = async (courseId) => {
  return await Course.findById(courseId)
    .populate({
      path: "modules",
      populate: { path: "lessons" },
    })
    .lean();
};

const findCourseForUser = async (courseId, userId) => {
  return await Course.findOne({ _id: courseId, userId })
    .populate({
      path: "modules",
      populate: { path: "lessons" },
    })
    .lean();
};

const getModule = async (courseId, moduleId) => {
  return await Module.findOne({
    _id: moduleId,
    course: courseId,
  }).lean();
};


const getLesson = async (lessonId) => {
  return await Lesson.findOne({
    _id: lessonId,
  });
};




const updateLessonStatus = async (lessonId, status) => {
  return await Lesson.findOneAndUpdate(
    { _id: lessonId },
    { isGenerated: status },
    { new: true },
  );
};

const saveCourseOutlineToDB = async (course, existingCourseId = null) => {
  let newCourse;
  if (existingCourseId) {
    // Update existing course
    newCourse = await Course.findById(existingCourseId);
    if (!newCourse) {
      throw new Error(`Course with id ${existingCourseId} not found`);
    }
    // Update title and description if provided
    if (course.title) newCourse.title = course.title;
    if (course.description) newCourse.description = course.description;
    if (course.courseObjective)
      newCourse.courseObjective = course.courseObjective;
    // Clear existing modules (we'll add new ones)
    // First delete old modules and lessons to avoid orphaned docs
    if (newCourse.modules && newCourse.modules.length > 0) {
      const oldModules = await Module.find({ _id: { $in: newCourse.modules } });
      const oldLessonIds = oldModules.flatMap((m) => m.lessons);
      await Lesson.deleteMany({ _id: { $in: oldLessonIds } });
      await Module.deleteMany({ _id: { $in: newCourse.modules } });
    }
    newCourse.modules = [];
  } else {
    // Create new course
    newCourse = await Course.create({
      title: course.title,
      description: course.description,
      courseObjective: course.courseObjective || "Master the topic",
      userId: course.userId,
      modules: [],
    });
  }

  for (const module of course.modules) {
    const newModule = await Module.create({
      moduleIndex: module.moduleIndex || newCourse.modules.length + 1,
      title: module.title || `Module ${newCourse.modules.length + 1}`,
      description: module.description || "",
      lessons: [],
      course: newCourse._id,
    });

    for (const lesson of module.lessons) {
      console.log("module value (saveCourseOutlineToDB):", newModule._id);
      console.log(
        "typeof module (saveCourseOutlineToDB):",
        typeof newModule._id,
      );
      const newLesson = await Lesson.create({
        lessonIndex: lesson.lessonIndex || newModule.lessons.length + 1,
        title: lesson.title || `Lesson ${newModule.lessons.length + 1}`,
        briefDescription: lesson.description || lesson.briefDescription || "",
        module: newModule._id,
        isGenerated: "PENDING",
      });

      newModule.lessons.push(newLesson._id);
    }

    await newModule.save();

    newCourse.modules.push(newModule._id);
  }

  await newCourse.save();

  return newCourse._id;
};

const saveHinglishContent = async (moduleId, lessonId, content) => {
  console.log("module value (saveHinglishContent):", moduleId);
  console.log("typeof module (saveHinglishContent):", typeof moduleId);
  const lesson = await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
  });

  if (!lesson) return null;

  lesson.hinglishContent = content;
  await lesson.save();

  return lesson;
};

const findRecentCoursesByUser = async (userId, limit = 3) => {
  return await Course.find({ userId })
    .sort({ createdAt: -1, lastAccessedAt: -1 })
    .limit(limit)
    .select("title description createdAt lastAccessedAt")
    .lean();
};





const searchVectorDB = async (embedding) => {
  try {
    const result = await Course.aggregate([
      {
        $vectorSearch: {
          index: "course_embedding_index",

          path: "embedding",

          queryVector: embedding,

          numCandidates: 100,

          limit: 1,
        },
      },

      {
        $project: {
          title: 1,
          description: 1,
          learningIntent: 1,
          userId: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error("Vector Search Error:", error.message);

    throw error;
  }
};





const findLessonForUser = async ({ moduleId, lessonId, userId }) => {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
  }).lean();

  if (!lesson || !userId) return lesson;

  const module = await Module.findById(moduleId).select("course").lean();
  if (!module) return null;

  const courseExists = await Course.exists({ _id: module.course, userId });
  return courseExists ? lesson : null;
};

const claimLessonGeneration = async (lessonId) => {
  return await Lesson.findOneAndUpdate(
    { _id: lessonId, isGenerated: { $in: ["PENDING", "FAILED", "GENERATING"] } },
    { isGenerated: "GENERATING" },
    { new: true },
  );
};

const completeLessonForUser = async ({ moduleId, lessonId, userId, quizScore }) => {
  const lesson = await findLessonForUser({ moduleId, lessonId, userId });
  if (!lesson) return null;

  return await Lesson.findOneAndUpdate(
    { _id: lessonId, module: moduleId },
    {
      isCompleted: true,
      completedAt: new Date(),
      ...(Number.isFinite(quizScore) ? { quizScore } : {}),
    },
    { new: true },
  );
};



const checkLessonExistsForUser = async (lessonId) => {
  const lesson = await Lesson.findOne({
    _id: lessonId,
  }).lean();

  return lesson && Boolean(lesson.content);
};



const saveLesson = async (moduleId, lessonId, lessonObj) => {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
  });

  if (!lesson) return null;

  if (lessonObj.title !== undefined) lesson.title = lessonObj.title;
  if (lessonObj.content !== undefined) lesson.content = lessonObj.content;
  if (lessonObj.youtubeQuery !== undefined) lesson.youtubeQuery = lessonObj.youtubeQuery;
  if (lessonObj.retrievalCitations !== undefined) lesson.retrievalCitations = lessonObj.retrievalCitations;

  if (lessonObj.content) lesson.isGenerated = "GENERATED";

  await lesson.save();
  return lesson;
};

// Wrapped versions with logging
const wrappedFindById = async (id) => {
  const c = await findCourseById(id);
  if (!c) console.error(`[REPO] findById FAILED`, id);
  return c;
};

const wrappedGetModule = async (cid, mid) => {
  const m = await getModule(cid, mid);
  if (!m) console.error(`[REPO] getModule FAILED`, cid, mid);
  return m;
};


const wrappedGetLesson = async (lid) => {
  const l = await getLesson(lid);
  if (!l) console.error(`[REPO] getLesson FAILED`, lid);
  return l;
};


module.exports = {
  // Export the wrapped versions as the public API
  findById: wrappedFindById,
  findCourseForUser,
  getModule: wrappedGetModule,
  getLesson: wrappedGetLesson,
  saveCourseOutlineToDB,
  findRecentCoursesByUser,
  findLessonForUser,
  completeLessonForUser,
  checkLessonExistsForUser,
  saveLesson,
  updateLessonStatus,
  claimLessonGeneration,
  saveHinglishContent,
  searchVectorDB
};
