import { useEffect, useState } from "react";
import api from "../api/axios";

const useGetYouTubeVideos = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex
) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !courseId ||
      moduleIndex === null ||
      lessonIndex === null
    ) {
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        // 1️⃣ Generate YouTube query
        const queryRes = await api.post(
          "/course/generate/YTQ",
          {
            courseId,
            moduleId: moduleIndex,
            lessonId: lessonIndex,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 2️⃣ Fetch YouTube videos
        const videosRes = await api.post(
          "/course/get/utube",
          { data: queryRes.data.data },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setVideos(videosRes.data);
      } catch (err) {
        console.error("YouTube fetch failed:", err);
        setError("Failed to load YouTube videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    courseId,
    moduleIndex,
    lessonIndex,
  ]);

  return { videos, loading, error };
};

export default useGetYouTubeVideos;
