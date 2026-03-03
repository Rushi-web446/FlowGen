const Course = require("../models/course");
const Module = require("../models/module");
const Lesson = require("../models/lesson");
const mongoose = require("mongoose");


const findById = async (courseId) => {
  return await Course.findById(courseId)
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

const getLesson = async (moduleId, lessonId) => {
  return await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
  }).lean();
};



const updateLessonStatus = async (moduleId, lessonId, status) => {
  return await Lesson.findOneAndUpdate(
    {
      _id: lessonId,
      module: moduleId,
    },
    { isGenerated: status },
    { new: true }
  );
};




const saveCourseOutlineToDB = async (course) => {

  const newCourse = await Course.create({
    title: course.title,
    description: course.description,
    courseObjective: course.courseObjective || "Master the topic",
    userId: course.userId,
    modules: [],
  });

  for (const module of course.modules) {

    const newModule = await Module.create({
      moduleIndex: module.moduleIndex || (newCourse.modules.length + 1),
      title: module.title || `Module ${newCourse.modules.length + 1}`,
      description: module.description || "",
      lessons: [],
      course: newCourse._id,
    });

    for (const lesson of module.lessons) {

      console.log("module value (saveCourseOutlineToDB):", newModule._id);
      console.log("typeof module (saveCourseOutlineToDB):", typeof newModule._id);
      const newLesson = await Lesson.create({
        lessonIndex: lesson.lessonIndex || (newModule.lessons.length + 1),
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


const findRecentCoursesByUser = async (
  userId,
  limit = 3
) => {
  return await Course.find({ userId })
    .sort({ createdAt: -1, lastAccessedAt: -1 })
    .limit(limit)
    .select("title description createdAt lastAccessedAt")
    .lean();

};




const findLessonForUser = async ({
  moduleId,
  lessonId,
}) => {

  return await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
  }).lean();

};



const checkLessonExistsForUser = async ({
  moduleId,
  lessonId,
}) => {

  const lesson = await Lesson.findOne({
    _id: lessonId,
    module: moduleId,
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

  if (lessonObj.content) lesson.isGenerated = "GENERATED";

  await lesson.save();
  return lesson;
};






module.exports = {

  findById: async (id) => {
    const c = await findById(id);
    if (!c)
      console.error(`[REPO] findById FAILED`, id);
    return c;
  },

  getModule: async (cid, mid) => {
    const m = await getModule(cid, mid);
    if (!m)
      console.error(`[REPO] getModule FAILED`, cid, mid);
    return m;
  },

  getLesson: async (mid, lid) => {
    const l = await getLesson(mid, lid);
    if (!l)
      console.error(`[REPO] getLesson FAILED`, mid, lid);
    return l;
  },

  saveCourseOutlineToDB,

  findRecentCoursesByUser,

  findLessonForUser,

  checkLessonExistsForUser,

  saveLesson,

  updateLessonStatus,

  saveHinglishContent,


};