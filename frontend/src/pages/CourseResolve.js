import { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import LessonTransition from "../components/lesson/LessonTransition";

const CourseResolver = () => {

  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;

    const resolveCourse = async () => {
      try {
        // axios interceptor will automatically add JWT token
        const res = await api.get(`/course/resolve/${courseId}`);

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
  }, [courseId, isAuthenticated, navigate]);

  return <LessonTransition />;
};

export default CourseResolver;
