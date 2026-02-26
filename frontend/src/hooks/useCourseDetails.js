


import { useEffect, useState } from "react";
import api from "../api/axios";

const useCourseDetails = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId
) => {
  const [course, setCourse] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
  useEffect(() => {
    if (!isAuthenticated || !courseId) return;
    
    const fetchCourseDetails = () => {
      try {
        const token = getAccessTokenSilently();

        const res = api.get(
          `/course/details/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourse(res.data.course);
        setCurrentModuleIndex(res.data.progress.currentModule);
        setCurrentLessonIndex(res.data.progress.currentLesson);
      } catch (err) {
        console.error(err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, []);

  const goToNextLesson = () => {
    if (!course) return;

    const currentModule = course.modules[currentModuleIndex];

    const lessons = currentModule.topics || currentModule.lessons || [];
    const totalLessonsInModule = lessons.length;

    if (currentLessonIndex < totalLessonsInModule - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    } else {
      if (currentModuleIndex < course.modules.length - 1) {
        setCurrentModuleIndex((prev) => prev + 1);
        setCurrentLessonIndex(0);
      } else {
        console.log("Course Completed");
      }
    }
  };

  return {
    loading,
    error,
    course,
    currentModuleIndex,
    currentLessonIndex,
    goToNextLesson,
  };
};

export default useCourseDetails;
