import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useRef, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

import LessonPDF from "../components/lesson/LessonPDF";
import LessonViewer from "../components/lesson/LessonViewer";
import CourseRoadmap from "../components/lesson/CourseRoadmap";
import LessonLoadingProgress from "../components/lesson/LessonLoadingProgress";
import LessonTransition from "../components/lesson/LessonTransition";
import GoToTopButton from "../components/GoToTopButton";
import ProfessionalFooter from "../components/layout/ProfessionalFooter";

import useFetchLesson from "../hooks/useFetchLesson";
import api from "../api/axios";

const Course = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const pdfRef = useRef(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // simple notification when feature not available yet
  const notifyComingSoon = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(
      "This feature is under development and will be available in the future.",
    );
    msg.lang = "en-US";
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
  };

  const { lesson, youtubeVideos, loading, error, progressState } =
    useFetchLesson({
      courseId,
      moduleIndex,
      lessonIndex,
    });

  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!isAuthenticated || !courseId) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/course/details/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseData(res.data.course);
      } catch (err) {
        console.error("Failed to fetch course structure:", err);
      }
    };

    fetchCourseStructure();
  }, [courseId, isAuthenticated, getAccessTokenSilently]);

  const downloadPDF = () => {
    if (!lesson) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${lesson?.title || "lesson"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "css" },
      })
      .from(pdfRef.current)
      .save();
  };

  if (isTransitioning) {
    return <LessonTransition />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <LessonLoadingProgress progressState={progressState} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <>
      <CourseRoadmap
        courseData={courseData}
        isOpen={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        currentModuleIndex={Number(moduleIndex)}
        currentLessonIndex={Number(lessonIndex)}
      />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#020617",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <button
            onClick={() =>
              navigate(`/course/${courseId}`, {
                state: { from: location.pathname },
              })
            }
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(99, 102, 241, 0.25)";
              e.target.style.borderColor = "rgba(99, 102, 241, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(99, 102, 241, 0.15)";
              e.target.style.borderColor = "rgba(99, 102, 241, 0.3)";
            }}
          >
            🗺️ Roadmap
          </button>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(148, 163, 184, 0.15)",
                color: "#cbd5e1",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(148, 163, 184, 0.25)";
                e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(148, 163, 184, 0.15)";
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
              }}
            >
              ← Back to Home
            </button>

            {/* Explain Content Button (placeholder) */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={notifyComingSoon}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#86efac",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(34, 197, 94, 0.25)";
                  e.target.style.borderColor = "rgba(34, 197, 94, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(34, 197, 94, 0.15)";
                  e.target.style.borderColor = "rgba(34, 197, 94, 0.3)";
                }}
              >
                💡 Explain (coming soon)
              </button>
            </div>

            <button
              onClick={downloadPDF}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              📄 Download PDF
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Content */}
          <div style={{ padding: "0 2rem 4rem 2rem" }}>
            {/* Hidden PDF container for export (off-screen) */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <LessonPDF
                ref={pdfRef}
                course={courseData}
                lesson={lesson}
                youtubeVideos={youtubeVideos}
              />
            </div>

            {!lesson ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <h2 style={{ color: "#94a3b8" }}>Lesson not found</h2>
              </div>
            ) : (
              <LessonViewer lesson={lesson} youtubeVideos={youtubeVideos} />
            )}

            {/* Footer */}
            <div
              style={{
                marginTop: "4rem",
                padding: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            ></div>
          </div>
        </main>
      </div>

      {/* Professional Footer */}
      <ProfessionalFooter />

      {/* Go To Top Button */}
      <GoToTopButton />
    </>
  );
};

export default Course;