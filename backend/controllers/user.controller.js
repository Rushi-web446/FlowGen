const { saveCourseForUserService } = require("../services/user.service");

const saveCourseForUser = async (req, res) => {

  const { courseId } = req.body;
  const userId = req.appUser._id; // ⚠️ see next section

  try {
    await saveCourseForUserService(userId, courseId);
    return res.status(201).json({ message: "success." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { saveCourseForUser };