const { getYouTubeVideosService } = require("../services/YouTube.service");

const getYouTubeVideos = async (req, res) => {
    console.log("\n\n\n\n  --> reaching :  backend/controllers/YouTube.controller.js . \n\n\n");


    const query = req.body["data"]["query"];

    try {
        const responce = await getYouTubeVideosService(query);

        // ADD THIS LINE TO SEND RESPONSE TO CLIENT
        return res.status(200).json(responce);

    } catch (error) {
        // Log the actual error to see what went wrong
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "error while fetching youtube videos", error: error.message });
    }
};

module.exports = {
    getYouTubeVideos,
};