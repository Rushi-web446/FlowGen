const fs = require("fs");
const path = require("path");
const {
  findById,
  getModule,
  getLesson,
} = require("../repository/course.repository");



const getOutlinePrompt = ({ topicName, description }) => {

  if (!topicName) {
    throw new Error("topicName or description missing");
  }

  if (!description) description = topicName;

  const filePath = path.join(__dirname, "./outline.prompt");
  const promptTemplate = fs.readFileSync(filePath, "utf-8");

  return promptTemplate
    .replaceAll("{{topic}}", topicName)
    .replaceAll("{{description}}", description);
};


const getFinalPrompt = (prompt, course, module, lesson) => {
  return prompt
    .replaceAll("{{course.title}}", course.title || "")
    .replaceAll("{{module.title}}", module.title || "")
    .replaceAll("{{lesson.title}}", lesson.title || "")
    .replaceAll("{{lesson.description}}", lesson.description || "");
};

const getLessonPrompt = async (courseId, moduleId, lessonId) => {
  const course = await findById(courseId);
  if (!course) throw new Error(`Course not found: ${courseId}`);

  const module = await getModule(courseId, moduleId);
  if (!module) throw new Error(`Module not found: ${moduleId} for course ${courseId}`);

  const lesson = await getLesson(moduleId, lessonId);
  if (!lesson) throw new Error(`Lesson not found: ${lessonId} for module ${moduleId}`);

  const filePath = path.join(__dirname, "./lesson.prompt");
  let prompt = fs.readFileSync(filePath, "utf-8");

  return getFinalPrompt(prompt, course, module, lesson);
};

const getYouTubeQueryPrompt = async (courseId, moduleId, lessonId) => {


  const course = await findById(courseId);
  if (!course) return null;

  const module = await getModule(courseId, moduleId);
  if (!module) return null;

  const lesson = await getLesson(moduleId, lessonId);
  if (!lesson) return null;

  const filePath = path.join(__dirname, "./YouTube.query.prompt");
  let prompt = fs.readFileSync(filePath, "utf-8");

  return getFinalPrompt(prompt, course, module, lesson);
}

const getTopicAndDesciptionExtractionPrompt = async ({ prompt }) => {
  const filePath = path.join(__dirname, "./extraction.prompt");
  const tempPrompt = fs.readFileSync(filePath, "utf-8");

  const finalPrompt = tempPrompt.replaceAll("{{prompt}}", prompt);
  return finalPrompt;

}

const getHinglishPrompt = (lessonContent) => {
  const filePath = path.join(__dirname, "./hinglish.prompt");
  const promptTemplate = fs.readFileSync(filePath, "utf-8");

  return promptTemplate.replaceAll("{{lessonContent}}", lessonContent);
};

module.exports = { getOutlinePrompt, getLessonPrompt, getTopicAndDesciptionExtractionPrompt, getYouTubeQueryPrompt, getHinglishPrompt };
