const { saveCourseForUser } = require("../repository/user.repository");


const saveCourseForUserService = async (userId, courseId) => {
    return await saveCourseForUser(userId, courseId);
};


module.exports = { saveCourseForUserService };