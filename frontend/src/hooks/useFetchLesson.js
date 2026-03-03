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
        const authHeader = { Authorization: `Bearer ${token}` };

        // Step 1: Resolve moduleId and lessonId from indexes using course details
        const courseRes = await api.get(`/course/details/${courseId}`, {
          headers: authHeader,
        });

        const courseData = courseRes.data.course;
        const targetModule = courseData.modules.find(
          (m) => m.moduleIndex === Number(moduleIndex)
        );

        if (!targetModule) throw new Error("Module not found");

        const targetLesson = targetModule.lessons.find(
          (l) => l.lessonIndex === Number(lessonIndex)
        );

        if (!targetLesson) throw new Error("Lesson not found");

        const moduleId = targetModule._id.toString();
        const lessonId = targetLesson._id.toString();

        // Step 2: Poll the backend with ObjectIds
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
            params: { moduleId, lessonId },
            headers: authHeader,
          });

          if (res.data.status === "READY") {
            const lessonData = res.data.lesson;
            setLesson(lessonData);

            try {
              // Sequential Step 3: Generate YouTube Query
              const ytQueryRes = await api.post(
                "/course/generate/YTQ",
                { courseId, moduleId, lessonId },
                { headers: authHeader }
              );

              if (cancelled) return;

              const query = ytQueryRes.data?.data?.query;

              if (query) {
                // Sequential Step 4: Fetch YouTube Videos
                const ytVideosRes = await api.post(
                  "/course/get/utube",
                  { data: { query } },
                  { headers: authHeader }
                );

                if (cancelled) return;

                setYoutubeVideos(ytVideosRes.data || []);
              }
            } catch (ytErr) {
              console.error("Failed to fetch YouTube data:", ytErr);
            }

            if (!cancelled) {
              setProgressState("completed");
            }
            break;
          }

          pollCount++;
          await sleep(1500);
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
