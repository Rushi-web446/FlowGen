// const express = require("express");
// const router = express.Router();
const { saveCourseForUser } = require("../controllers/user.controller");
// const { protect } = require("../middleware/auth.js");



// router.post("/sync", protect, (req, res) => {
//     // Middleware syncUser already ran and attached req.user
//     res.status(200).json({ message: "User synced", user: req.user });
// });





// module.exports = router;


const express = require("express");
const checkJwt = require("../middleware/auth.middleware");
const syncUser = require("../middleware/user.sync.middleware");

const router = express.Router();

router.post("/save/course", checkJwt, syncUser, saveCourseForUser);
router.get("/me", checkJwt, syncUser, (req, res) => {
  res.json(req.appUser);
});

module.exports = router;