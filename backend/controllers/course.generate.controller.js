const {
  generateOutlineService,
  generateLessonService,
  generateTopicAndDesciptionService,
  generateYouTubeQueryService,
} = require("../services/course.generate.service");

const { checkLessonExistsService, lessonGenerationFlow } = require("../services/course.service");


const {
  getOutlinePrompt,
  getLessonPrompt,
  getTopicAndDesciptionExtractionPrompt,
  getYouTubeQueryPrompt,
} = require("../Prompts/helper.prompt");

const { getLesson, findLessonForUser } = require("../repository/course.repository");
const { enqueueLessonGeneration } = require("../services/job.service");
const Module = require("../models/module");






const generateTopicAndDesciption = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const data = await generateTopicAndDesciptionService({ prompt });
    return res.status(201).json({
      message: "course topic and descrptio generated Successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });z
  }
};





const generateOutline = async (req, res) => {

  try {
    const prompt = getOutlinePrompt(req.body);

    const data = await generateOutlineService({ prompt });

    return res.status(201).json({
      message: "course Outline Generated successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};




const generateLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;


    if (!lessonId) {
      return res.status(400).json({
        message: "lessonId is required",
      });
    }

    const lesson = await findLessonForUser({ lessonId, userId: req.appUser._id });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    const module = await Module.findById(lesson.module).select("course").lean();
    const { job, reused } = await enqueueLessonGeneration({
      courseId: module.course.toString(), moduleId: lesson.module.toString(), lessonId,
      idempotencyKey: req.get("Idempotency-Key"),
    });
    return res.status(reused ? 200 : 202).json({ jobId: job.id, reused, statusUrl: `/course/jobs/${job.id}` });

  } catch (error) {
    console.error("Error in generateLesson:", error);
    return res.status(500).json({ message: error.message });
  }
};



const generateYouTubeQueryController = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.body;
    if (!courseId || !moduleId || !lessonId)
      return res.status(400).json({ message: "Missing fields" });

    const prompt = await getYouTubeQueryPrompt(
      courseId,
      moduleId,
      lessonId
    );

    const data = await generateYouTubeQueryService(prompt);

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};



module.exports = { generateTopicAndDesciption, generateOutline, generateLesson, generateYouTubeQueryController };
