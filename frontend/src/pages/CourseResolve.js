import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";

const CourseResolver = () => {

  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;

    const resolveCourse = async () => {
      try {
        const token = await getAccessTokenSilently();

        // ✅ ONE backend call to Resolver
        const res = await api.get(
          `/course/resolve/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { moduleIndex, lessonIndex } = res.data;

        // ✅ Navigate ONLY after data is ready
        navigate(
          `/course/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`,
          { replace: true }
        );
      } catch (err) {
        // optional: redirect home or error page
        navigate("/home", { replace: true });
      }
    };

    resolveCourse();
  }, [courseId, isAuthenticated, getAccessTokenSilently, navigate]);

  // Resolver has no UI responsibility
  return <h2>Preparing your lesson…</h2>;
};

export default CourseResolver;
