import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";
import CourseRoadmap from "../components/lesson/CourseRoadmap";

const CourseOverview = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getAccessTokenSilently } = useAuth0();

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await api.get(`/course/details/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCourseData(res.data.course);
            } catch (err) {
                setError("Failed to load course. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, getAccessTokenSilently]);

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
        />
    );
};

export default CourseOverview;
