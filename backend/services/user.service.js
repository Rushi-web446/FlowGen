const { saveCourseForUser } = require("../repository/user.repository");


const saveCourseForUserService = async (userId, courseId) => {
    console.log("\n\n\n\n  --> reaching :  backend/services/user.service.js . \n\n\n");
    return await saveCourseForUser(userId, courseId);
};


module.exports = { saveCourseForUserService };