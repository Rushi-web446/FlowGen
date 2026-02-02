const express = require("express");
const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");
const router = express.Router();

const { saveCourseForUser } = require("../controllers/user.controller");


router.post("/save/course", checkJwt, syncUser, saveCourseForUser);
router.get("/me", checkJwt, syncUser, (req, res) => {
  res.json(req.appUser);
});

module.exports = router;