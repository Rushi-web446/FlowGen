const express = require("express");
const { generateTopicAndDesciption, generateOutline, generateLesson, generateYouTubeQueryController } = require("../controllers/course.generate.controller.js");
const { saveCourseOutlineToDB, getRecentCourses, getCourseDetails,
  completeLesson,
  getCurrentLessonContent,
  checkLessonExists,
  saveLesson,
  resolveNextLesson,
  getLessonDetails,
  explainLesson,
  checkHinglishStatus,
  getUserCourse,
} = require("../controllers/course.controller.js");

const { getYouTubeVideos } = require("../controllers/YouTube.controller.js");

const { courseQueueController, lessonQueueController } = require("../controllers/queue.controller.js");

const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");


const router = express.Router();



// Extract Course Topic and Description
router.post("/extract", checkJwt, syncUser, generateTopicAndDesciption);


// Generate Course Outline
router.post("/generate/outline", checkJwt, syncUser, courseQueueController);


router.post("/save/outline", checkJwt, syncUser, saveCourseOutlineToDB);



router.get("/recent", checkJwt, syncUser, getRecentCourses); // users top 3 recent access course

router.get("/course", checkJwt, syncUser, getUserCourse); //  user's course history


router.get("/details/:id", checkJwt, syncUser, getCourseDetails); // course detailes for showing roadmap 


// generating or fetching lesson via high priority queue.
router.get("/get/lesson/:courseId", checkJwt, syncUser, lessonQueueController);



// generating youtube query for lesson
router.post("/generate/YTQ", checkJwt, syncUser, generateYouTubeQueryController);


// this is the lesson details for showing roadmap 
router.get("/fetch/:courseId", checkJwt, syncUser, getLessonDetails);

// fetching youtube videos for lesson
router.post("/get/utube", checkJwt, syncUser, getYouTubeVideos);


// crude on lesson 
router.get("/check/lesson/:id", checkJwt, syncUser, checkLessonExists);
router.post("/generate/lesson", checkJwt, syncUser, generateLesson);
router.post("/save/lesson", checkJwt, syncUser, saveLesson);
router.get("/get/lesson/", checkJwt, syncUser, getCurrentLessonContent);




// // hinglish explanation for lesson
// router.post("/explain/lesson/", checkJwt, syncUser, explainLesson);
// router.get("/check/hinglish/", checkJwt, syncUser, checkHinglishStatus);





module.exports = router;
