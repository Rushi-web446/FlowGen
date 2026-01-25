import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const useFetchLesson = ({ courseId, moduleIndex, lessonIndex }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [lesson, setLesson] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;

    let cancelled = false;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getAccessTokenSilently();

        while (!cancelled) {
          // alert("atleast coming to this");
          const res = await api.get(`/course/get/lesson/${courseId}`, {
            params: {
              moduleIndex: Number(moduleIndex),
              lessonIndex: Number(lessonIndex),
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // alert(`\n\n ${JSON.stringify(res.data)}`);

          if (res.data.status === "READY") {
            setLesson(res.data.lesson);
            setYoutubeVideos(res.data.lesson.youtubeVideos || []);
            break;
          }

          // ⏳ lesson still generating → wait & retry
          await sleep(1000);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load lesson");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLesson();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    courseId,
    moduleIndex,
    lessonIndex,
  ]);

  return {
    lesson,
    youtubeVideos,
    loading,
    error,
  };
};

export default useFetchLesson;
