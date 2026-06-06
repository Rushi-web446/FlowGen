import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import CourseRoadmap from "../components/lesson/CourseRoadmap";

const CourseOverview = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // axios interceptor will automatically add JWT token
                const res = await api.get(`/course/details/${courseId}`);
                console.log("Fetched course details:", res.data);
                setCourseData(res.data.course);
            } catch (err) {
                console.error("Error fetching course:", err);
                setError(`Failed to load course: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    if (loading) {
        return (
            <div style={{
                display: "flex", height: "100vh", background: "#020617",
                color: "white", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem"
            }}>
                Loading course...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: "flex", height: "100vh", background: "#020617",
                color: "white", alignItems: "center", justifyContent: "center"
            }}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        // Pass isOpen=true always (not a modal here — it's the full page)
        // onClose navigates back to home
        <CourseRoadmap
            courseData={courseData}
            isOpen={true}
            onClose={() => navigate(location.state?.from || "/home")}
            currentModuleIndex={null}
            currentLessonIndex={null}
            isFullPage={true}
        />
    );
};

export default CourseOverview;
