import { useState } from "react";
import api from "../api/axios";

export const useJobProgress = (getAccessTokenSilently) => {
  const [newCourse, setNewCourse] = useState(null);
  const [progressState, setProgressState] = useState("idle"); // idle, extracting, generating, creating, completed, failed
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = async (previousCourses) => {
    if (!previousCourses || previousCourses.length === 0) return;

    setIsPolling(true);
    setProgressState("extracting");

    let pollCount = 0;
    const maxPolls = 120; 

    const poll = async () => {
      try {
        pollCount++;

        if (pollCount <= 2) {
          setProgressState("extracting");
        } else if (pollCount <= 6) {
          setProgressState("generating");
        } else {
          setProgressState("creating");
        }

        const token = await getAccessTokenSilently();
        const res = await api.get("/course/recent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentCourses = res.data.courses || [];

        const newCourseDetected = detectNewCourse(previousCourses, currentCourses);

        if (newCourseDetected) {
          setNewCourse(newCourseDetected);
          setProgressState("completed");
          setIsPolling(false);
          return; // Stop polling
        }

        if (pollCount < maxPolls) {
          setTimeout(poll, 2500); 
        } else {
          setProgressState("failed");
          setIsPolling(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setProgressState("failed");
        setIsPolling(false);
      }
    };

    poll();
  };

  const detectNewCourse = (previousCourses, currentCourses) => {
    if (currentCourses.length > previousCourses.length) {
      const newCourses = currentCourses.filter(
        (current) =>
          !previousCourses.some((prev) => prev.courseId === current.courseId)
      );

      if (newCourses.length > 0) {
        return newCourses[0]; 
      }
    }

    if (currentCourses.length === previousCourses.length) {
      for (let i = 0; i < currentCourses.length; i++) {
        if (currentCourses[i].courseId !== previousCourses[i]?.courseId) {
          return currentCourses[i];
        }
      }
    }

    return null;
  };

  const resetProgress = () => {
    setNewCourse(null);
    setProgressState("idle");
    setIsPolling(false);
  };

  return {
    newCourse,
    progressState,
    isPolling,
    startPolling,
    resetProgress,
  };
};
