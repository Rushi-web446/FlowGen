import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthSync } from "../hooks/useAuthSync";
import { useRecentCourses } from "../hooks/useRecentCourses";
import { useCourseGeneration } from "../hooks/useCourseGeneration";
import { useJobProgress } from "../hooks/useJobProgress";
import HomeSidebar from "../components/layout/HomeSidebar";
import ProfessionalFooter from "../components/layout/ProfessionalFooter";
import CourseGenerationProgress from "../components/CourseGenerationProgress";
import NewCourseCard from "../components/NewCourseCard";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [prompt, setPrompt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // ✅ FIXED
  const [waiting, setWaiting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState(null);

  const userReady = useAuthSync(
    isAuthenticated,
    getAccessTokenSilently,
    user
  );

  const { courses, loading: coursesLoading } = useRecentCourses(
    isAuthenticated,
    userReady,
    getAccessTokenSilently,
    refreshKey
  );

  const { generateCourse, loading, error } = useCourseGeneration(
    getAccessTokenSilently
  );

  const {
    newCourse,
    progressState,
    isPolling,
    startPolling,
    resetProgress,
  } = useJobProgress(getAccessTokenSilently);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt.trim().split(/\s+/).length < 5) {
      alert("Enter at least 5 words");
      return;
    }

    try {
      setNewCourseData(null);
      resetProgress();
      setWaiting(true);

      // Snapshot existing course IDs BEFORE generation starts.
      // Works when courses = [] (Set will be empty) and when courses.length > 0.
      // useJobProgress will detect any courseId NOT in this snapshot as the new course.
      const existingCourseIds = new Set(courses.map((c) => c.courseId));

      await generateCourse(prompt);
      setPrompt("");

      startPolling(existingCourseIds);
    } catch (err) {
      console.warn("Course generation failed:", err);
      setWaiting(false);
    }
  };

  // ✅ CRITICAL FIX — works even when user had 0 courses
  useEffect(() => {
    if (newCourse) {
      setNewCourseData(newCourse);
      setWaiting(false);

      // Force re-fetch recent courses
      setRefreshKey((prev) => prev + 1);
    }
  }, [newCourse]);

  return (
    <>
      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        loading={coursesLoading}
        recentCourses={courses}
        getAccessTokenSilently={getAccessTokenSilently}
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
              disabled={isPolling || waiting}
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || waiting || isPolling}
            >
              {isPolling
                ? "Generating Course..."
                : loading || waiting
                  ? "Creating..."
                  : "Generate Course"}
            </button>
          </form>

          {error && (
            <div className="error-message">⚠️ {error}</div>
          )}

          {isPolling && (
            <CourseGenerationProgress
              progressState={progressState}
            />
          )}
        </div>

        {/* My Courses Section */}
        <div className="my-courses-section">
          <h2 className="section-title">My Courses</h2>

          {coursesLoading && !newCourseData && (
            <div className="loading-state">
              <div className="skeleton-loader"></div>
              <div className="skeleton-loader"></div>
              <div className="skeleton-loader"></div>
            </div>
          )}

          {!coursesLoading &&
            courses.length === 0 &&
            !newCourseData && (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p className="empty-state-text">
                  No courses yet. Create your first course
                  above!
                </p>
              </div>
            )}

          {(courses.length > 0 || newCourseData) && (
            <div className="courses-grid">
              {newCourseData && (
                <NewCourseCard
                  course={newCourseData}
                  onNavigate={(course) =>
                    navigate(`/course/${course.courseId}`)
                  }
                />
              )}

              {courses
                .filter((course) => course.courseId !== newCourseData?.courseId)
                .map((course) => (
                  <div
                    key={course.courseId}
                    className="course-card"
                    onClick={() =>
                      navigate(`/course/${course.courseId}`)
                    }
                  >
                    <h3 className="course-card-title">
                      {course.courseTitle}
                    </h3>
                    <p className="course-card-description">
                      {course.courseDescription}
                    </p>
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