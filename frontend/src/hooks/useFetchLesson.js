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
  const [progressState, setProgressState] = useState("setup"); 

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;

    let cancelled = false;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError("");
        setProgressState("setup");

        const token = await getAccessTokenSilently();

        let pollCount = 0;
        const maxPolls = 150;

        while (!cancelled && pollCount < maxPolls) {
          if (pollCount <= 5) {
            setProgressState("setup");
          } else if (pollCount <= 15) {
            setProgressState("loading");
          } else {
            setProgressState("finalizing");
          }

          const res = await api.get(`/course/get/lesson/${courseId}`, {
            params: {
              moduleIndex: Number(moduleIndex),
              lessonIndex: Number(lessonIndex),
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.data.status === "READY") {
            setLesson(res.data.lesson);
            setYoutubeVideos(res.data.lesson.youtubeVideos || []);
            setProgressState("completed");
            break;
          }

          pollCount++;
          await sleep(2000); 
        }

        if (pollCount >= maxPolls && !cancelled) {
          throw new Error("Lesson loading timeout");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load lesson");
          setProgressState("failed");
        }
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
    progressState,
  };
};

export default useFetchLesson;
