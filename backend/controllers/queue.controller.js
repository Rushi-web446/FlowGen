const { courseQueue, lessonQueue } = require("../queues");
const { getOutlinePrompt } = require("../Prompts/helper.prompt");
const { getLesson } = require("../repository/course.repository");

const { updateLessonStatus } = require("../repository/course.repository");







const courseQueueController = async (req, res) => {
  console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

  try {
    const prompt = getOutlinePrompt(req.body);

    await courseQueue.add(
      "GENERATE_COURSE_OUTLINE", // job name
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

    console.log("\n\n\n %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% \n\n\n\n");

    console.log("▶ lessonQueueController", {
      courseId,
      moduleIndex,
      lessonIndex,
    });

    const lesson = await getLesson(courseId, moduleIndex, lessonIndex);

    // ✅ CASE 1: already generated
    if (lesson.isGenerated === "GENERATED") {
      const lessonData = lesson.content;
      console.log(
        "\n\n this lesson was already generated \n\n\n\n\n",
        JSON.stringify(lessonData),
      );
      return res.json({
        status: "READY",
        lesson: lesson.content, // 👈 actual lesson data
        youtubeVideos: lesson.youtubeVideos || [],
      });
    }

    const status = "PENDING";
    // ✅ CASE 3: first request → mark PENDING + enqueue ONCE
    await updateLessonStatus(courseId, moduleIndex, lessonIndex, status);

    console.log("\n\n Going to add lesson into high priority queue \n\n");

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

    console.log("\n\n job added into high priority queue \n\n");

    return res.status(202).json({
      status: "GENERATING",
    });
  } catch (err) {
    console.error("❌ lessonQueueController error:", err);
    return res.status(500).json({
      error: "Failed to fetch lesson",
    });
  }
};

module.exports = {
  courseQueueController,
  lessonQueueController,
};
