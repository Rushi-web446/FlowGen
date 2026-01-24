const {
  generateOutlineService,
  generateLessonService,
  generateTopicAndDesciptionService,
  generateYouTubeQueryService,
} = require("../services/course.generate.service");

// [NEW] Import the YouTube video service
const { getYouTubeVideosService } = require("../services/YouTube.service");

const {
  getOutlinePrompt,
  getLessonPrompt,
  getTopicAndDesciptionExtractionPrompt,
  getYouTubeQueryPrompt,
} = require("../Prompts/helper.prompt");



const generateTopicAndDesciption = async (req, res) => {
  console.log("\n\n\n\n  --> reaching :  backend/controllers/course.generate.controller.js . \n\n\n");
  try {
    const prompt = await getTopicAndDesciptionExtractionPrompt(req.body);
    const data = await generateTopicAndDesciptionService({ prompt });
    return res.status(201).json({
      message: "course topic and descrptio generated Successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const generateOutline = async (req, res) => {
  console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

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
    const { courseId, moduleId, lessonId } = req.body;

    if (!courseId || !moduleId || !lessonId) {
      return res.status(400).json({
        message: "courseId, moduleId, lessonId are required",
      });
    }



    const lessonPrompt = await getLessonPrompt(
      courseId,
      Number(moduleId),
      Number(lessonId)
    );

    if (!lessonPrompt) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const data = await generateLessonService(lessonPrompt);

    return res.status(201).json({
      message: "Lesson generated successfully",
      data,
    });
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
      Number(moduleId),
      Number(lessonId)
    );

    const data = await generateYouTubeQueryService(prompt);

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};



module.exports = { generateTopicAndDesciption, generateOutline, generateLesson, generateYouTubeQueryController };
