const fs = require("fs");
const path = require("path");
const {
  findById,
  getModule,
  getLesson,
} = require("../repository/course.repository");

const getOutlinePrompt = ({ topicName, description }) => {
  console.log("topicName:", topicName);
  console.log("description:", description);

  if (!topicName || !description) {
    throw new Error("topicName or description missing");
  }

  const filePath = path.join(__dirname, "./outline.prompt");
  const promptTemplate = fs.readFileSync(filePath, "utf-8");

  return promptTemplate
    .replaceAll("{{topic}}", topicName)
    .replaceAll("{{description}}", description);
};


const getFinalPrompt = (prompt, course, module, lesson) => {
  return prompt
    .replaceAll("{{course.title}}", course.title || "")
    .replaceAll("{{course.courseObjective}}", course.courseObjective || "")
    .replaceAll("{{module.title}}", module.title || "")
    .replaceAll("{{module.moduleObjective}}", module.moduleObjective || "")
    .replaceAll("{{module.description}}", module.description || "")
    .replaceAll("{{lesson.title}}", lesson.title || "")
    .replaceAll("{{lesson.lessonObjective}}", lesson.lessonObjective || "")
    .replaceAll("{{lesson.description}}", lesson.description || "");
};

const getLessonPrompt = async (courseId, moduleId, lessonId) => {


  const course = await findById(courseId);
  if (!course) return null;

  const module = await getModule(courseId, moduleId);
  if (!module) return null;

  const lesson = await getLesson(courseId, moduleId, lessonId);
  if (!lesson) return null;

  const filePath = path.join(__dirname, "./lesson.prompt");
  let prompt = fs.readFileSync(filePath, "utf-8");

  return getFinalPrompt(prompt, course, module, lesson);

};

const getYouTubeQueryPrompt = async (courseId, moduleId, lessonId) => {

  console.log(`\n\n\n\n reaching ${__filename}/getYouTubeQueryPrompt \n\n\n\n`);

  const course = await findById(courseId);
  if (!course) return null;

  const module = await getModule(courseId, moduleId);
  if (!module) return null;

  const lesson = await getLesson(courseId, moduleId, lessonId);
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

module.exports = { getOutlinePrompt, getLessonPrompt, getTopicAndDesciptionExtractionPrompt, getYouTubeQueryPrompt };
