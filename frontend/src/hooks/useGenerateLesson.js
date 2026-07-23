
import { useEffect, useState } from "react";

/**
 * useGenerateLesson - Generates a lesson via SSE
 * Triggers generation when lesson is accessed but not yet generated
 */
const useGenerateLesson = (
  isAuthenticated,
  lessonId,
  shouldGenerate = false
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !lessonId || !shouldGenerate) {
      return;
    }

    let cancelled = false;

    const generateLesson = async () => {
      try {
        setLoading(true);
        setError("");
        setEvents([]);

        const token = localStorage.getItem("localJWT");
        if (!token) {
          throw new Error("Not authenticated. Please refresh the page.");
        }

        const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001";
        const url = `${baseURL}/course/generate/lesson`;

        // Queue the work, then subscribe to progress on its own request.
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lessonId }),
        });

        if (!response.ok && !cancelled) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const queued = await response.json();
        if (!queued.jobId) throw new Error("Generation job was not created");
        const eventResponse = await fetch(`${baseURL}/course/jobs/${queued.jobId}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!eventResponse.ok) throw new Error("Unable to subscribe to generation progress");
        const reader = eventResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let lessonData = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];

            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));
                if (!cancelled) {
                  setEvents((prev) => [...prev, eventData]);

                  if (eventData.state === "completed" && eventData.result?.lesson) lessonData = eventData.result.lesson;

                  // Handle errors
                  if (eventData.state === "failed") throw new Error(eventData.failedReason || "Lesson generation failed");
                }
              } catch (parseError) {
                console.error("Failed to parse SSE event:", parseError);
              }
            }
          }
        }

        if (!cancelled && lessonData) {
          setData(lessonData);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Lesson generation error:", err);
          setError(err.message || "Failed to generate lesson");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateLesson();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, lessonId, shouldGenerate]);

  return { data, loading, error, events };
};

export default useGenerateLesson;

