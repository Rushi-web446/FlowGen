const express = require('express');
const router = express.Router();

const { getYouTubeVideos } = require("../controllers/YouTube.controller");
const { protect } = require("../middleware/auth");


router.post("/get/utube", protect, getYouTubeVideos);

module.exports = router;