import { useNavigate, useParams } from "react-router-dom";
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
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const pdfRef = useRef(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [explainMenuOpen, setExplainMenuOpen] = useState(false);

  const speakText = (text, lang = "hi-IN") => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech not supported.");
      return;
    }
    window.speechSynthesis.cancel();

    if (!text) return;

    let textToSpeak = "";
    if (typeof text === 'object') {
      if (text.introduction) textToSpeak += text.introduction + " ";
      if (text.mainPoints) {
        text.mainPoints.forEach(p => {
          textToSpeak += (p.heading || "") + ". " + (p.explanation || "") + " ";
        });
      }
      if (text.examples) {
        text.examples.forEach(e => {
          textToSpeak += "Example: " + (e.title || "") + ". " + (e.content || "") + " ";
        });
      }
      if (text.summary) textToSpeak += "Summary: " + text.summary;
    } else {
      textToSpeak = text;
    }

    textToSpeak = textToSpeak.replace(/[*#_`]/g, '');

    const chunks = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];
    let currentChunk = 0;

    const speakNext = () => {
      if (currentChunk >= chunks.length) return;

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk].trim());
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        currentChunk++;
        speakNext();
      };

      utterance.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        currentChunk++;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleExplain = async (lang) => {
    try {
      setExplainMenuOpen(false);
      const token = await getAccessTokenSilently();
      const res = await api.get(`/course/lesson/explain/${courseId}`, {
        params: {
          moduleIndex: Number(moduleIndex),
          lessonIndex: Number(lessonIndex)
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const lessonData = res.data.lesson;
      const content = lang === "hi-IN" ? lessonData.hinglishContent : (lessonData.content || lessonData.title);

      if (!content && lang === "hi-IN") {
        speakText("Hinglish version is still generating, please wait a moment.", lang);
      } else {
        speakText(content, lang);
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
      alert("Failed to load explanation from server.");
    }
  };

  const {
    lesson,
    youtubeVideos,
    loading,
    error,
    progressState,
  } = useFetchLesson({
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourseData(res.data.course);
      } catch (err) {
        console.error("Failed to fetch course structure:", err);
      }
    };

    fetchCourseStructure();
  }, [courseId, isAuthenticated, getAccessTokenSilently]);



  const onCompleteAndNext = async () => {
    try {
      setIsTransitioning(true);
      const token = await getAccessTokenSilently();

      await api.post(
        `/course/complete/lesson/${courseId}`,
        {
          moduleIndex: Number(moduleIndex),
          lessonIndex: Number(lessonIndex),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTimeout(() => {
        navigate(`/course/${courseId}/resolve`, { replace: true });
      }, 4000);
    } catch (err) {
      console.error(err);
      setIsTransitioning(false);
      alert("Failed to complete lesson");
    }
  };

  const downloadPDF = () => {
    if (!lesson) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${lesson?.title || "lesson"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
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

      <div style={{ display: "flex", minHeight: "100vh", background: "#020617", flexDirection: "column" }}>
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
            onClick={() => setRoadmapOpen(true)}
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

            {/* Explain Content Button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setExplainMenuOpen(!explainMenuOpen)}
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
                💡 Explain
              </button>

              {explainMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.25rem",
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
                    zIndex: 200,
                    minWidth: "180px",
                    overflow: "hidden",
                    backdropFilter: "blur(16px)"
                  }}
                >
                  <button
                    onClick={() => handleExplain("en-US")}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: "#f8fafc",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    🇺🇸 Pure English
                  </button>
                  <button
                    onClick={() => handleExplain("hi-IN")}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: "#f8fafc",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    🇮🇳 Hinglish
                  </button>
                </div>
              )}
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

            <button
              onClick={onCompleteAndNext}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#6366f1",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 0 25px rgba(99, 102, 241, 0.6)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.4)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              ✔ Completed
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
            {/* Hidden PDF */}
            <div style={{ display: "none" }}>
              <LessonPDF
                ref={pdfRef}
                lesson={lesson}
                youtubeVideos={youtubeVideos}
              />
            </div>

            {!lesson ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <h2 style={{ color: "#94a3b8" }}>Lesson not found</h2>
              </div>
            ) : (
              <LessonViewer
                lesson={lesson}
                youtubeVideos={youtubeVideos}
              />
            )}

            {/* Footer */}
            <div
              style={{
                marginTop: "4rem",
                padding: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            >
              <h3 style={{ color: "#f8fafc", marginBottom: "1.5rem" }}>
                Finished this lesson?
              </h3>

              <button
                onClick={onCompleteAndNext}
                style={{
                  padding: "12px 32px",
                  borderRadius: "12px",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 0 30px rgba(99, 102, 241, 0.6)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 0 20px rgba(99, 102, 241, 0.4)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                ✔ Mark as Completed
              </button>
            </div>
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
