const express = require("express");
const { generateTopicAndDesciption, generateOutline, generateLesson, generateYouTubeQueryController } = require("../controllers/course.generate.controller.js");
// const { protect } = require("../middleware/auth.js"); // Removed legacy auth
const { saveCourseOutlineToDB, getRecentCourses, getCourseDetails,
  completeLesson,
  getCurrentLessonContent,
  checkLessonExists,
  saveLesson,
  getYouTubeVideos,
  resolveNextLesson,
  getLessonDetails,
} = require("../controllers/course.controller.js");

const {courseQueueController, lessonQueueController} = require("../controllers/queue.controller.js");

const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");


const router = express.Router();

router.post("/extract", checkJwt, syncUser, generateTopicAndDesciption);
// router.post("/generate/outline", checkJwt, syncUser, generateOutline);
// router.post("/save/outline", checkJwt, syncUser, saveCourseOutlineToDB);


router.post("/generate/outline", checkJwt, syncUser, courseQueueController);
router.post("/save/outline", checkJwt, syncUser, saveCourseOutlineToDB);




router.get("/recent", checkJwt, syncUser, getRecentCourses);
router.get("/details/:id", checkJwt, syncUser, getCourseDetails); // get current (module, lesson)
router.get("/check/lesson/:id", checkJwt, syncUser, checkLessonExists);


router.post("/generate/lesson", checkJwt, syncUser, generateLesson);
router.post("/save/lesson", checkJwt, syncUser, saveLesson);
// router.get("/get/lesson/:id", checkJwt, syncUser, getCurrentLessonContent);


router.get("/get/lesson/:courseId", checkJwt, syncUser, lessonQueueController);


                                                                                                      



router.get("/get/lesson/", checkJwt, syncUser, getCurrentLessonContent);






router.post("/generate/YTQ", checkJwt, syncUser, generateYouTubeQueryController);
router.post("/get/utube", checkJwt, syncUser, getYouTubeVideos);


router.post("/complete/lesson/:id", checkJwt, syncUser, completeLesson);




// Resolver Route
router.get("/resolve/:courseId", checkJwt, syncUser, resolveNextLesson);

// Combined Fetch Route (Lesson + Videos)
router.get("/fetch/:courseId", checkJwt, syncUser, getLessonDetails);

module.exports = router;
