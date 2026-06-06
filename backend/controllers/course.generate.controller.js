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

const { getLesson } = require("../repository/course.repository");






const generateTopicAndDesciption = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log(`\n\n from controller printing user_prompt : \n {prompt} \n\n\n`);
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

    // Setup SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");


    // Call lessonGenerationFlow with SSE response
    return await lessonGenerationFlow(lessonId, res);

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
