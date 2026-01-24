const {
  saveCourseOutlineToDBService,
  getRecentCoursesService,
  completeLessonService,
  getCourseDetailsWithProgressService,
  getLessonContentService,
  checkLessonExistsService,
  saveLessonService,
  getYouTubeVideosService,
} = require("../services/course.service");

// Import generation services directly
const { generateLessonService } = require("../services/course.generate.service");
const { getLessonPrompt } = require("../Prompts/helper.prompt");

const saveCourseOutlineToDB = async (req, res) => {
  try {
    const outline = req.body;
    const userId = req.appUser._id;

    console.log("OUTLINE RECEIVED:", JSON.stringify(outline, null, 2));

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
  try {
    const userId = req.appUser._id;
    const courses = await getRecentCoursesService(userId);
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("ERROR FETCHING RECENT COURSES:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error("ERROR FETCHING COURSE DETAILS:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeLesson = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.appUser._id;
    const { moduleIndex, lessonIndex } = req.body;

    const result = await completeLessonService({
      courseId,
      userId,
      moduleIndex,
      lessonIndex,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("ERROR COMPLETING LESSON:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentLessonContent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.appUser._id;
    const { moduleIndex, lessonIndex } = req.query;

    if (moduleIndex === null || lessonIndex === null) {
      return res.status(400).json({
        success: false,
        message: "moduleIndex and lessonIndex required",
      });
    }

    const data = await getLessonContentService({
      courseId,
      userId,
      moduleIndex: Number(moduleIndex),
      lessonIndex: Number(lessonIndex),
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("ERROR FETCHING LESSON CONTENT:", error);
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
    const courseId = req.params.id;
    const userId = req.appUser._id;
    const { moduleIndex, lessonIndex } = req.query;

    if (moduleIndex === null || lessonIndex === null) {
      return res.status(400).json({
        success: false,
        message: "moduleIndex and lessonIndex required",
      });
    }

    const result = await checkLessonExistsService({
      courseId,
      userId,
      moduleIndex: Number(moduleIndex),
      lessonIndex: Number(lessonIndex),
    });

    return res.status(200).json({
      success: true,
      exists: result.exists,
    });
  } catch (error) {
    console.error("ERROR CHECKING LESSON:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveLesson = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex, lesson } = req.body;
    const userId = req.appUser._id;

    if (!courseId || moduleIndex === null || lessonIndex === null || !lesson) {
      return res.status(400).json({
        success: false,
        message: "Missing required lesson data",
      });
    }

    const saved = await saveLessonService({
      courseId,
      userId,
      moduleIndex: Number(moduleIndex),
      lessonIndex: Number(lessonIndex),
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

// Resolver Controller
const resolveNextLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.appUser._id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // 1. Get Course Progress (finds the first incomplete lesson)
    const courseDetails = await getCourseDetailsWithProgressService(courseId, userId);

    if (!courseDetails || !courseDetails.progress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    const { currentModule, currentLesson } = courseDetails.progress;

    // 2. Check if lesson exists
    let lessonExistsResult = await checkLessonExistsService({
      courseId,
      userId,
      moduleIndex: currentModule,
      lessonIndex: currentLesson,
    });

    // 3. If NOT exists, GENERATE it
    if (!lessonExistsResult.exists) {
      console.log(`Generating lesson for Course: ${courseId}, Module: ${currentModule}, Lesson: ${currentLesson}`);

      const lessonPrompt = await getLessonPrompt(
        courseId,
        Number(currentModule),
        Number(currentLesson)
      );

      if (!lessonPrompt) {
        return res.status(404).json({ message: "Failed to generate lesson prompt" });
      }

      const generatedData = await generateLessonService(lessonPrompt);

      if (!generatedData) {
        return res.status(500).json({ message: "Failed to generate lesson content" });
      }

      await saveLessonService({
        courseId,
        userId,
        moduleIndex: Number(currentModule),
        lessonIndex: Number(currentLesson),
        lesson: generatedData
      });
    }

    // Return next indices
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

// Fetch Lesson Details + Videos
const getLessonDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIndex, lessonIndex } = req.query;
    const userId = req.appUser._id;

    if (!courseId || moduleIndex === undefined || lessonIndex === undefined) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // 1. Get Lesson Content
    const lessonData = await getLessonContentService({
      courseId,
      userId,
      moduleIndex: Number(moduleIndex),
      lessonIndex: Number(lessonIndex),
    });

    if (!lessonData || !lessonData.lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // 2. Get YouTube Videos
    const query = lessonData.lesson.videoQuery || `${lessonData.lesson.title} tutorial`;

    let videos = [];
    try {
      videos = await getYouTubeVideosService(query);
    } catch (ytError) {
      console.error("Failed to fetch YouTube videos (non-blocking):", ytError);
    }

    return res.status(200).json({
      lesson: lessonData.lesson,
      youtubeVideos: videos
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
  getYouTubeVideos,
  resolveNextLesson,
  getLessonDetails,
};
