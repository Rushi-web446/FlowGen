const { getYouTubeVideos } = require("../repository/YouTube.repository");

const getYouTubeVideosService = async (query) => {
    try {
        return await getYouTubeVideos(query);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getYouTubeVideosService
};