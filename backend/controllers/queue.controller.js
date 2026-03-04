const { courseQueue, highPriorityLessonQueue } = require("../queues");
const { getOutlinePrompt } = require("../Prompts/helper.prompt");
const {
  getLesson,
  updateLessonStatus,
} = require("../repository/course.repository");

const courseQueueController = async (req, res) => {
  try {
    const prompt = getOutlinePrompt(req.body);

    await courseQueue.add("GENERATE_COURSE_OUTLINE", {
      prompt,
      userId: req.appUser._id,
    });

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
    const { moduleId, lessonId } = req.query;
    const userId = req.appUser._id;




    const lesson = await getLesson(moduleId, lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    if (lesson.isGenerated === "GENERATED") {
      return res.json({
        status: "READY",
        lesson: {
          ...lesson.content,
          title: lesson.title,
          description: lesson.briefDescription,
          hinglishContent: lesson.hinglishContent,
          lessonIndex: lesson.lessonIndex,
          module: lesson.module,
          _id: lesson._id,
        },
      });
    }


    if (lesson.isGenerated === "GENERATING") {
      return res.status(202).json({
        status: "GENERATING",
      });
    }

    console.log("\n\n\n lessonQueueController \n\n\n", courseId, moduleId, lessonId, userId);

    await updateLessonStatus(moduleId, lessonId, "GENERATING");

    await highPriorityLessonQueue.add(
      "GENERATE_LESSON",
      { courseId, moduleId: moduleId, lessonId: lessonId, userId },
      {
        priority: 1,
      },
    );

    return res.status(202).json({
      status: "GENERATING",
    });


  } catch (err) {
    console.error("lessonQueueController error:", err);
    return res.status(500).json({
      error: "Failed to fetch lesson",
    });
  }
};

module.exports = {
  courseQueueController,
  lessonQueueController,
};
