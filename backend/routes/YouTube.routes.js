const express = require('express');
const router = express.Router();

const { getYouTubeVideos } = require("../controllers/YouTube.controller");
// CHANGE THIS LINE: Use destructuring to get the 'protect' function
const { protect } = require("../middleware/auth");


// CHANGE THIS LINE: Use 'protect' instead of 'protected'
router.post("/get/utube", protect, getYouTubeVideos);

module.exports = router;