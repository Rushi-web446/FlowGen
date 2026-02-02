const { getYouTubeVideosService } = require("../services/YouTube.service");

const getYouTubeVideos = async (req, res) => {


    const query = req.body["data"]["query"];

    try {
        const responce = await getYouTubeVideosService(query);

        return res.status(200).json(responce);

    } catch (error) {
        return res.status(500).json({ message: "error while fetching youtube videos", error: error.message });
    }
};

module.exports = {
    getYouTubeVideos,
};