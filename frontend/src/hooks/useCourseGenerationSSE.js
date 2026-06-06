import { useState } from "react";

/**
 * useCourseGenerationSSE - Handles Server-Sent Events for course generation
 * Backend streams progress events and returns course data when complete
 */
export const useCourseGenerationSSE = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  const generateCourseWithSSE = async (prompt) => {
    setLoading(true);
    setError("");
    setEvents([]);

    try {
      const token = localStorage.getItem("localJWT");
      if (!token) {
        throw new Error("Not authenticated. Please refresh the page.");
      }

      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const url = `${baseURL}/course/generate/outline`;

      // Use fetch for SSE support (axios doesn't handle streaming well)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let courseData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setEvents((prev) => [...prev, data]);

              // Extract course data from SUCCESS events
              if (data.type === "SUCCESS" && data.course) {
                courseData = data.course;
              }

              // Handle errors
              if (data.type === "ERROR") {
                throw new Error(data.message || "Course generation failed");
              }
            } catch (parseError) {
              console.error("Failed to parse SSE event:", parseError);
            }
          }
        }
      }

      setLoading(false);
      return courseData;
    } catch (err) {
      console.error("Course generation error:", err);
      const errorMessage = err.message || "Failed to generate course";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return {
    generateCourseWithSSE,
    loading,
    error,
    events,
  };
};
