const express = require("express");
const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");
const { createNote, tutorChat } = require("../controllers/learning.controller");

const router = express.Router();
router.post("/notes", checkJwt, syncUser, createNote);
router.post("/tutor", checkJwt, syncUser, tutorChat);
module.exports = router;
