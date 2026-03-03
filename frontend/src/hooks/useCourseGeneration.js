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

      console.log(`\n\n\n ${JSON.stringify(prompt)} \n\n\n`);

      const extractRes = await api.post(
        "/course/extract",
        { prompt },
        { headers }
      );


      console.log(`\n\n\n ${JSON.stringify(extractRes)} \n\n\n`);


      const outlineRes = await api.post(
        "/course/generate/outline",
        extractRes.data.data,
        { headers }
      );

      console.log(`\n\n\n ${JSON.stringify(outlineRes)} \n\n\n`);



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
