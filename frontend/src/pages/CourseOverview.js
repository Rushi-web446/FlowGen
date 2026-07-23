import { Navigate, useParams } from "react-router-dom";

const CourseOverview = () => {
  const { courseId } = useParams();
  return <Navigate to={`/course/${courseId}/resolve`} replace />;
};

export default CourseOverview;
