import { useEffect, useState } from "react";
import api from "../api/axios";

const useGetCurrentLesson = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex
) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !isAuthenticated ||
      !courseId ||
      moduleIndex === undefined ||
      lessonIndex === undefined
    ) {
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getAccessTokenSilently();

        const res = await api.get(
          `/course/get/lesson/${courseId}`,
          {
            params: {
              moduleIndex: Number(moduleIndex),
              lessonIndex: Number(lessonIndex),
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLesson(res.data.lesson ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch lesson content");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    courseId,
    moduleIndex,
    lessonIndex,
  ]);

  return { lesson, loading, error };
};

export default useGetCurrentLesson;
