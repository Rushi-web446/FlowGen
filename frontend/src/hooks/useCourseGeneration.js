import { useState } from "react";
import api from "../api/axios";

export const useCourseGeneration = (getAccessTokenSilently) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCourse = async (prompt) => {
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const headers = { Authorization: `Bearer ${token}` };

      // The backend handles the entire flow (extract intent → generate outline → save course)
      // and streams events back via SSE
      const response = await api.post(
        "/course/generate/outline",
        { prompt },
        { headers }
      );

      return response;
    } catch (err) {
      console.error("Course generation error:", err);
      setError(err.response?.data?.message || "Failed to generate course");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateCourse, loading, error };
};
