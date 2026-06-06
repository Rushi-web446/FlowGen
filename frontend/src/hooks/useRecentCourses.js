import { useEffect, useState } from "react";
import api from "../api/axios";

export const useRecentCourses = (
  isAuthenticated,
  token,
  refreshKey 
) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    
    const loadCourses = async () => {
      try {
        setLoading(true);
        // axios interceptor will automatically add JWT token from localStorage
        const res = await api.get("/course/course");
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [isAuthenticated, token, refreshKey]);

  return { courses, loading };
};

