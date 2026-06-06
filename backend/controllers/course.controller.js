const {
  saveCourseOutlineToDBService,
  getRecentCoursesService,
  completeLessonService,
  getCourseDetailsWithProgressService,
  getLessonContentService,
  checkLessonExistsService,
  saveLessonService,
  getYouTubeVideosService,
  getUserCourseService,
  generateCourseFlow,
} = require("../services/course.service");

const {
  generateLessonService,
  generateHinglishService,
} = require("../services/course.generate.service");
const {
  getLessonPrompt,
  getHinglishPrompt,
} = require("../Prompts/helper.prompt");

const {
  getLesson,
  saveHinglishContent,
} = require("../repository/course.repository");

const saveCourseOutlineToDB = async (req, res) => {
  try {
    const outline = req.body;
    const userId = req.appUser._id;

    const savedCourseId = await saveCourseOutlineToDBService({
      outline,
      userId,
    });

    return res.status(201).json({
      message: "Course outline saved successfully",
      courseId: savedCourseId,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Saving course outline failed",
    });
  }
};

const getRecentCourses = async (req, res) => {
  console.log("\n\n\n\n c ***************************\n\n\n");

  try {
    const userId = req.appUser._id;
    const courses = await getRecentCoursesService(userId);
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserCourse = async (req, res) => {
  try {
    const userId = req.appUser._id;
    const courses = await getUserCourseService(userId);
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const setupSSE = (res) => {

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.flushHeaders();
};



const handleCourseGeneration = async (req, res) => {
  try {
    // Validate incoming request
    const userPrompt = req.body?.prompt?.trim();
    const userId = req.appUser?._id;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required. Please provide a learning topic or description.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed. Please log in again.",
      });
    }

    if (userPrompt.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Prompt must be at least 3 characters long.",
      });
    }

    if (userPrompt.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Prompt must not exceed 500 characters.",
      });
    }


    // Set up Server-Sent Events (SSE)
    setupSSE(res);

    // Start the course generation flow with userId
    return await generateCourseFlow(userPrompt, res, userId);
  } catch (error) {
    console.error("❌ handleCourseGeneration error:", error);

    // Only send error if headers not yet sent
    if (!res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "ERROR",
          message: "Course generation failed unexpectedly",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        })}\n\n`,
      );
    }

    return res.end();
  }
};

const getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.appUser._id;

    const result = await getCourseDetailsWithProgressService(courseId, userId);

    return res.status(200).json({
      success: true,
      course: result.course,
      progress: result.progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeLesson = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.body;

    const result = await completeLessonService({
      moduleId,
      lessonId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentLessonContent = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.query;

    const safeGetId = (val) => {
      if (!val) return val;
      if (typeof val === "object")
        return val._id ? val._id.toString() : val.toString();
      return val;
    };

    const targetModuleId = safeGetId(moduleId);
    const targetLessonId = safeGetId(lessonId);

    const data = await getLessonContentService({
      moduleId: targetModuleId,
      lessonId: targetLessonId,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getYouTubeVideos = async (req, res) => {
  try {
    const query = req.body?.data?.query;
    if (!query) throw new Error("Query missing");

    const videos = await getYouTubeVideosService(query);
    return res.status(200).json(videos);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const checkLessonExists = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.query;

    if (!moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "moduleId and lessonId required",
      });
    }

    const safeGetId = (val) => {
      if (!val) return val;
      if (typeof val === "object")
        return val._id ? val._id.toString() : val.toString();
      return val;
    };

    const targetModuleId = safeGetId(moduleId);
    const targetLessonId = safeGetId(lessonId);

    const result = await checkLessonExistsService({
      moduleId: targetModuleId,
      lessonId: targetLessonId,
    });

    return res.status(200).json({
      success: true,
      exists: result.exists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveLesson = async (req, res) => {
  try {
    const { moduleId, lessonId, lesson } = req.body;

    if (!moduleId || !lessonId || !lesson) {
      return res.status(400).json({
        success: false,
        message: "Missing required lesson data",
      });
    }

    const saved = await saveLessonService({
      moduleId,
      lessonId,
      lesson,
    });

    return res.status(200).json({
      success: true,
      message: "Lesson saved successfully",
      lesson: saved,
    });
  } catch (error) {
    console.error("ERROR SAVING LESSON:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const resolveNextLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.appUser._id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const courseDetails = await getCourseDetailsWithProgressService(
      courseId,
      userId,
    );

    if (!courseDetails || !courseDetails.progress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    const { currentModule, currentLesson } = courseDetails.progress;

    let lessonExistsResult = await checkLessonExistsService({
      courseId,
      userId,
      moduleIndex: currentModule,
      lessonIndex: currentLesson,
    });

    if (!lessonExistsResult.exists) {
      console.log(
        `Generating lesson for Course: ${courseId}, Module: ${currentModule}, Lesson: ${currentLesson}`,
      );

      const lessonPrompt = await getLessonPrompt(
        courseId,
        Number(currentModule),
        Number(currentLesson),
      );

      if (!lessonPrompt) {
        return res
          .status(404)
          .json({ message: "Failed to generate lesson prompt" });
      }

      const generatedData = await generateLessonService(lessonPrompt);

      if (!generatedData) {
        return res
          .status(500)
          .json({ message: "Failed to generate lesson content" });
      }

      await saveLessonService({
        courseId,
        userId,
        moduleIndex: Number(currentModule),
        lessonIndex: Number(currentLesson),
        lesson: generatedData,
      });
    }

    return res.status(200).json({
      courseId,
      moduleIndex: currentModule,
      lessonIndex: currentLesson,
    });
  } catch (error) {
    console.error("resolveNextLesson error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getLessonDetails = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.query;

    if (!moduleId || !lessonId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const lessonData = await getLessonContentService({
      moduleId,
      lessonId,
    });

    if (!lessonData || !lessonData.lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    return res.status(200).json({
      lesson: lessonData.lesson,
    });
  } catch (error) {
    console.error("getLessonDetails error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveCourseOutlineToDB,
  getRecentCourses,
  getCourseDetails,
  completeLesson,
  getCurrentLessonContent,
  checkLessonExists,
  saveLesson,
  resolveNextLesson,
  getLessonDetails,
  getUserCourse,
  handleCourseGeneration,
};
