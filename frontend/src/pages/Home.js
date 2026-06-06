import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useRecentCourses } from "../hooks/useRecentCourses";
import { useCourseGenerationSSE } from "../hooks/useCourseGenerationSSE";
import HomeSidebar from "../components/layout/HomeSidebar";
import ProfessionalFooter from "../components/layout/ProfessionalFooter";
import NewCourseCard from "../components/NewCourseCard";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [prompt, setPrompt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressEvents, setProgressEvents] = useState([]);
  const [generationComplete, setGenerationComplete] = useState(false);

  const { courses, loading: coursesLoading } = useRecentCourses(
    !!token,
    token,
    refreshKey
  );

  const {
    generateCourseWithSSE,
    loading,
    error,
    events,
  } = useCourseGenerationSSE();

  // Track progress events
  useEffect(() => {
    setProgressEvents(events);
  }, [events]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt.trim().split(/\s+/).length < 5) {
      alert("Enter at least 5 words");
      return;
    }

    try {
      setProgressEvents([]);
      setGenerationComplete(false);

      const courseData = await generateCourseWithSSE(prompt);
      setPrompt("");
      setGenerationComplete(true);

      // Refresh course list
      setRefreshKey((prev) => prev + 1);

      // Navigate to course overview page
      if (courseData && courseData._id) {
        navigate(`/course/${courseData._id}`);
      }
    } catch (err) {
      console.warn("Course generation failed:", err);
    }
  };

  return (
    <>
      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        loading={coursesLoading}
        recentCourses={courses}
      />

      <div className="home-container">
        <button
          className="open-sidebar-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="home-header">
          <h1 className="welcome-title">
            Welcome back, {user?.name}!
          </h1>
          <p className="welcome-subtitle">
            Create your next learning journey
          </p>
        </div>

        <div className="course-generation-section">
          <h2 className="section-title">Create New Course</h2>

          <form onSubmit={handleSubmit} className="course-form">
            <textarea
              className="course-textarea"
              placeholder="Describe what you want to learn... (at least 5 words)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? "Generating Course..."
                : generationComplete
                  ? "Navigating..."
                  : "Generate Course"}
            </button>
          </form>

          {error && (
            <div className="error-message">⚠️ {error}</div>
          )}

          {loading && progressEvents.length > 0 && (
            <div className="progress-events">
              {progressEvents.map((event, idx) => (
                <div key={idx} className="progress-event">
                  {event.message || "Processing..."}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Courses Section */}
        <div className="my-courses-section">
          <h2 className="section-title">My Courses</h2>

          {coursesLoading && (
            <div className="loading-state">
              <div className="skeleton-loader"></div>
              <div className="skeleton-loader"></div>
              <div className="skeleton-loader"></div>
            </div>
          )}

          {!coursesLoading && courses.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p className="empty-state-text">
                No courses yet. Create your first course above!
              </p>
            </div>
          )}

          {courses.length > 0 && (
            <div className="courses-grid">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="course-card"
                  onClick={() =>
                    navigate(
                      `/course/${course.courseId}`
                    )
                  }
                >
                  <NewCourseCard
                    course={course}
                    onNavigate={() =>
                      navigate(
                        `/course/${course.courseId}`
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfessionalFooter />
    </>
  );
};

export default Home;