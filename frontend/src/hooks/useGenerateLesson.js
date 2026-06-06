
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

        // Use fetch for SSE support
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

        // Read SSE stream
        const reader = response.body.getReader();
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

                  // Extract lesson data from SUCCESS events
                  if (eventData.type === "SUCCESS" && eventData.lesson) {
                    console.log("useGenerateLesson - SUCCESS event received:", eventData);
                    lessonData = eventData.lesson;
                    console.log("useGenerateLesson - lessonData extracted:", lessonData);
                  }

                  // Handle errors
                  if (eventData.type === "ERROR") {
                    throw new Error(eventData.message || "Lesson generation failed");
                  }
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

