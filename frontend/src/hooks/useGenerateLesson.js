


import { useEffect, useState } from "react";
import api from "../api/axios";

const useGenerateLesson = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex,
  exists
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !isAuthenticated ||
      !courseId ||
      moduleIndex === null ||
      lessonIndex === null ||
      exists
    ) {
      return;
    }

    const generate =  () => {
      try {
        setLoading(true);
        const token =  getAccessTokenSilently();

        const res =  api.post(
          "/course/generate/lesson",
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

        setData(res.data.data); 
      } catch (err) {
        console.error("Lesson generation failed:", err);
        setError("Failed to generate lesson");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    courseId,
    moduleIndex,
    lessonIndex,
    exists,
  ]);

  return { data, loading, error };
};

export default useGenerateLesson;
