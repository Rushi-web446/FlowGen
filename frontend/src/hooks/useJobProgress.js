import { useState } from "react";
import api from "../api/axios";

/**
 * useJobProgress
 *
 * Polls /course/recent until a new course appears that wasn't in the
 * pre-generation snapshot of course IDs (`existingCourseIds` Set).
 *
 * This approach is immune to the "0 courses" edge-case because it never
 * relies on array length comparisons — it only checks Set membership.
 *
 * @param {Function} getAccessTokenSilently - Auth0 token getter
 */
export const useJobProgress = (getAccessTokenSilently) => {
  const [newCourse, setNewCourse] = useState(null);
  const [progressState, setProgressState] = useState("idle"); // idle | extracting | generating | creating | completed | failed
  const [isPolling, setIsPolling] = useState(false);

  /**
   * startPolling
   *
   * @param {Set<string>} existingCourseIds - Set of courseId strings that
   *   existed BEFORE the user triggered generation. Pass `new Set()` when
   *   the user has zero existing courses.
   */
  const startPolling = (existingCourseIds = new Set()) => {
    setIsPolling(true);
    setProgressState("extracting");

    let pollCount = 0;
    const maxPolls = 120;

    const poll = async () => {
      try {
        pollCount++;

        // Update progress label based on elapsed poll count
        if (pollCount <= 2) {
          setProgressState("extracting");
        } else if (pollCount <= 6) {
          setProgressState("generating");
        } else {
          setProgressState("creating");
        }

        const token = await getAccessTokenSilently();
        const res = await api.get("/course/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentCourses = res.data.courses || [];

        // Detect new course: any entry whose courseId is NOT in the pre-gen snapshot.
        // Works when existingCourseIds is empty (first-ever course) or populated.
        const newCourseDetected = currentCourses.find(
          (course) => !existingCourseIds.has(course.courseId)
        );

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
