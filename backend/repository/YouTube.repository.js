const axios = require("axios");

const getYouTubeVideos = async (query) => {
    try {
        const searchRes = await axios.get(
            `${process.env.BASE_URL}/search`,
            {
                params: {
                    part: "snippet",
                    q: query,
                    type: "video",
                    maxResults: 25,
                    videoDuration: "medium",
                    videoEmbeddable: "true",
                    safeSearch: "strict",
                    relevanceLanguage: "en",
                    relevanceLanguage: "hi",
                    order: "relevance",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );


        if (!searchRes.data?.items?.length) return [];

        const videoIds = searchRes.data.items
            .map(v => v.id.videoId)
            .filter(Boolean)
            .join(",");

        const statsRes = await axios.get(
            `${process.env.BASE_URL}/videos`,
            {
                params: {
                    part: "statistics,snippet",
                    id: videoIds,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const keywords = query
            .toLowerCase()
            .split(" ")
            .filter(w => w.length > 3);

        const MATCH_THRESHOLD = Math.min(3, keywords.length);

        const strictlyRelevantVideos = statsRes.data.items.filter(video => {
            const text =
                (video.snippet.title + " " + video.snippet.description).toLowerCase();

            const matchCount = keywords.filter(word => text.includes(word)).length;

            return matchCount >= MATCH_THRESHOLD;
        });

        return strictlyRelevantVideos
            .map(video => ({
                videoId: video.id,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                views: Number(video.statistics.viewCount || 0),
                thumbnail: video.snippet.thumbnails.high.url,
                videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                embedUrl: `https://www.youtube.com/embed/${video.id}`
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 4);

    } catch (error) {
        console.error(
            "YouTube API Error:",
            error.response?.data || error.message
        );
        return [];
    }
};

module.exports = {
    getYouTubeVideos
};
