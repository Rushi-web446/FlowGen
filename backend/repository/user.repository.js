const User = require("../models/user");

const findById = async (userId) => {
  return await User.findById(userId);
};
const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findByAuth0Id = async (Auth0Id) => {
  return await User.findOne( { Auth0Id });
}

const addUser = async (user) => {
  return await User.create(user);
};

const saveCourseForUser = async (userId, courseId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { courses: courseId },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

module.exports = { findById, findByEmail, addUser, saveCourseForUser, findByAuth0Id };
