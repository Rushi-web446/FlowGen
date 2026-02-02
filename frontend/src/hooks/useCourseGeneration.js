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

      const extractRes = await api.post(
        "/course/extract",
        { prompt },
        { headers }
      );

      const outlineRes = await api.post(
        "/course/generate/outline",
        extractRes.data.data,
        { headers }
      );


      return outlineRes;
    } catch (err) {
      console.error(err);
      setError("Failed to generate course");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateCourse, loading, error };
};
