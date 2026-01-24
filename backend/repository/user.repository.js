const User = require("../models/user");

const findById = async (userId) => {
  console.log("\n\n\n\n  --> reaching :  backend/repository/user.repository.js . \n\n\n");
  return await User.findById(userId);
};
const findByEmail = async (email) => {
  console.log("\n\n\n\n  --> reaching :  backend/repository/user.repository.js . \n\n\n");
  return await User.findOne({ email });
};

const findByAuth0Id = async (Auth0Id) => {
  console.log("\n\n\n\n  --> reaching :  backend/repository/user.repository.js . \n\n\n");
  return await User.findOne( { Auth0Id });
}

const addUser = async (user) => {
  console.log("\n\n\n\n  --> reaching :  backend/repository/user.repository.js . \n\n\n");
  return await User.create(user);
};

const saveCourseForUser = async (userId, courseId) => {
  console.log("\n\n\n\n  --> reaching :  backend/repository/user.repository.js . \n\n\n");
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
