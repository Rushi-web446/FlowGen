const { getYouTubeVideos } = require("../repository/YouTube.repository");

const getYouTubeVideosService = async (query) => {
    console.log("\n\n\n\n  --> reaching :  backend/services/YouTube.service.js . \n\n\n");
    try {
        return await getYouTubeVideos(query);
    } catch (error) {
        // Throw the original error so we know what happened
        throw error;
    }
};

module.exports = {
    getYouTubeVideosService
};