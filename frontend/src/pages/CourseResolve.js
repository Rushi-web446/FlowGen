import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";
import LessonTransition from "../components/lesson/LessonTransition";

const CourseResolver = () => {

  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;

    const resolveCourse = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await api.get(
          `/course/resolve/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { moduleIndex, lessonIndex } = res.data;

        navigate(
          `/course/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`,
          { replace: true }
        );
      } catch (err) {
        navigate("/home", { replace: true });
      }
    };

    resolveCourse();
  }, [courseId, isAuthenticated, getAccessTokenSilently, navigate]);

  return <LessonTransition />;
};

export default CourseResolver;
