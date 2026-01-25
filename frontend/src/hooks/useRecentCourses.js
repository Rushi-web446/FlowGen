import { useEffect, useState } from "react";
import api from "../api/axios";

export const useRecentCourses = (
  isAuthenticated,
  userReady,
  getAccessTokenSilently,
  refreshKey // 👈 receive it
) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userReady) return;

    const loadCourses = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        const res = await api.get("/course/recent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [
    isAuthenticated,
    userReady,
    getAccessTokenSilently,
    refreshKey // ✅ THIS IS THE KEY FIX
  ]);

  return { courses, loading };
};
