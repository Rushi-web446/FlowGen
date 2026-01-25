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

      // 1️⃣ Extract
      const extractRes = await api.post(
        "/course/extract",
        { prompt },
        { headers }
      );

      // 2️⃣ Generate outline
      const outlineRes = await api.post(
        "/course/generate/outline",
        extractRes.data.data,
        { headers }
      );

      // // 3️⃣ Save outline (creates course)
      // const saveRes = await api.post(
      //   "/course/save/outline",
      //   outlineRes.data.data,
      //   { headers }
      // );

      // const courseId = saveRes.data.courseId; // ✅ NOW defined

      // // 4️⃣ Save course for user (THIS WAS MISSING / WRONG)
      // await api.post(
      //   "/user/save/course",
      //   { courseId }, // ✅ OBJECT — matches backend
      //   { headers }
      // );

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
