const express = require("express");
const { generateLesson, generateYouTubeQueryController } = require("../controllers/course.generate.controller.js");
const { saveCourseOutlineToDB, getRecentCourses, getCourseDetails,
  completeLesson,
  getCurrentLessonContent,
  checkLessonExists,
  saveLesson,
  resolveNextLesson,
  getLessonDetails,
  getUserCourse,
  handleCourseGeneration,
} = require("../controllers/course.controller.js");

const { getYouTubeVideos } = require("../controllers/YouTube.controller.js");

const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");
const validate = require("../middleware/validate");
const {
  generateOutlineSchema,
  courseIdParamSchema,
  resolveCourseSchema,
  generateLessonSchema,
  lessonQuerySchema,
  completeLessonSchema,
} = require("../validation/course.schemas");
const { createLessonJob, readJob, streamJob } = require("../controllers/job.controller");


const router = express.Router();






router.post("/generate/outline", checkJwt, syncUser, validate(generateOutlineSchema), handleCourseGeneration);







router.get("/recent", checkJwt, syncUser, getRecentCourses); // users top 3 recent access course

router.get("/course", checkJwt, syncUser, getUserCourse); //  user's course history



router.get("/details/:id", checkJwt, syncUser, validate(courseIdParamSchema), getCourseDetails);
router.get("/resolve/:courseId", checkJwt, syncUser, validate(resolveCourseSchema), resolveNextLesson);













router.post("/generate/lesson", checkJwt, syncUser, validate(generateLessonSchema), generateLesson);
router.post("/jobs/lessons", checkJwt, syncUser, validate(generateLessonSchema), createLessonJob);
router.get("/jobs/:jobId", checkJwt, syncUser, readJob);
router.get("/jobs/:jobId/events", checkJwt, syncUser, streamJob);












// generating youtube query for lesson
router.post("/generate/YTQ", checkJwt, syncUser, generateYouTubeQueryController);


// this is the lesson details for showing roadmap 
router.get("/fetch/:courseId", checkJwt, syncUser, getLessonDetails);

// fetching youtube videos for lesson
router.post("/get/utube", checkJwt, syncUser, getYouTubeVideos);


// crude on lesson 
router.get("/check/lesson", checkJwt, syncUser, validate(lessonQuerySchema), checkLessonExists);
router.post("/complete-lesson", checkJwt, syncUser, validate(completeLessonSchema), completeLesson);
router.post("/save/lesson", checkJwt, syncUser, saveLesson);
router.get("/get/lesson", checkJwt, syncUser, validate(lessonQuerySchema), getCurrentLessonContent);




// // hinglish explanation for lesson
// router.post("/explain/lesson/", checkJwt, syncUser, explainLesson);
// router.get("/check/hinglish/", checkJwt, syncUser, checkHinglishStatus);





module.exports = router;
