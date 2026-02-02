const { courseQueue, lessonQueue } = require("../queues");
const { getOutlinePrompt } = require("../Prompts/helper.prompt");
const { getLesson } = require("../repository/course.repository");

const { updateLessonStatus } = require("../repository/course.repository");







const courseQueueController = async (req, res) => {

  try {
    const prompt = getOutlinePrompt(req.body);

    await courseQueue.add(
      "GENERATE_COURSE_OUTLINE", // job name not neccesary that same as queue name. ok. 
      {
        prompt,
        userId: req.appUser._id,
      },
    );

    return res.status(201).json({
      message: "Course outline generation queued successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};




const lessonQueueController = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIndex, lessonIndex } = req.query;
    const userId = req.appUser._id;



    const lesson = await getLesson(courseId, moduleIndex, lessonIndex);

    if (lesson.isGenerated === "GENERATED") {
      const lessonData = lesson.content;

      return res.json({
        status: "READY",
        lesson: lesson.content, // 👈 actual lesson data
        youtubeVideos: lesson.youtubeVideos || [],
      });
    }

    const status = "PENDING";
    await updateLessonStatus(courseId, moduleIndex, lessonIndex, status);


    await lessonQueue.add(
      "GENERATE_LESSON",
      {
        courseId,
        moduleIndex,
        lessonIndex,
        userId,
      },
      {
        jobId: `lesson-${courseId}-${moduleIndex}-${lessonIndex}`,
        priority: 1,
      },
    );


    return res.status(202).json({
      status: "GENERATING",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch lesson",
    });
  }
};

module.exports = {
  courseQueueController,
  lessonQueueController,
};
