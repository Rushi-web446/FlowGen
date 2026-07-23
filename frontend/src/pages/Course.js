import { useNavigate, useParams } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

import LessonPDF from "../components/lesson/LessonPDF";
import LessonViewer from "../components/lesson/LessonViewer";
import LessonLoadingProgress from "../components/lesson/LessonLoadingProgress";
import LessonTransition from "../components/lesson/LessonTransition";
import GoToTopButton from "../components/GoToTopButton";
import ProfessionalFooter from "../components/layout/ProfessionalFooter";

import useFetchLesson from "../hooks/useFetchLesson";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Course = () => {
  const navigate = useNavigate();
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const { isAuthenticated } = useContext(AuthContext);

  const pdfRef = useRef(null);
  const [courseData, setCourseData] = useState(null);
  const [isTransitioning] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [completionSaving, setCompletionSaving] = useState(false);

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
        // Axios interceptor adds Authorization header automatically
        const res = await api.get(`/course/details/${courseId}`);
        setCourseData(res.data.course);
      } catch (err) {
        console.error("Failed to fetch course structure:", err);
      }
    };

    fetchCourseStructure();
  }, [courseId, isAuthenticated]);

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

  const completeLesson = async () => {
    const currentModule = courseData?.modules?.find(
      (module) => module.moduleIndex === Number(moduleIndex),
    );
    if (!lesson?._id || !currentModule?._id) return;

    try {
      setCompletionSaving(true);
      await api.post("/course/complete-lesson", {
        moduleId: currentModule._id,
        lessonId: lesson._id,
        ...(quizScore !== null ? { quizScore } : {}),
      });
      setCourseData((currentCourse) => ({
        ...currentCourse,
        modules: currentCourse.modules.map((module) =>
          module._id === currentModule._id
            ? {
                ...module,
                lessons: module.lessons.map((courseLesson) =>
                  courseLesson._id === lesson._id
                    ? { ...courseLesson, isCompleted: true, quizScore }
                    : courseLesson,
                ),
              }
            : module,
        ),
      }));
    } catch (completionError) {
      console.error("Failed to complete lesson:", completionError);
    } finally {
      setCompletionSaving(false);
    }
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
              <>
              <LessonViewer
                lesson={lesson}
                youtubeVideos={youtubeVideos}
                onQuizScore={setQuizScore}
                courseId={courseId}
                moduleId={courseData?.modules?.find((module) => module.moduleIndex === Number(moduleIndex))?._id}
              />
              <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                <button
                  onClick={completeLesson}
                  disabled={lesson.isCompleted || completionSaving}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: lesson.isCompleted ? "default" : "pointer",
                    background: lesson.isCompleted ? "rgba(34, 197, 94, 0.2)" : "#4f46e5",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  {lesson.isCompleted ? "✓ Lesson completed" : completionSaving ? "Saving progress..." : "Mark lesson complete"}
                </button>
              </div>
              </>
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
