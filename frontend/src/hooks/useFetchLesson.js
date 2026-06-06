import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import useGenerateLesson from "./useGenerateLesson";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const useFetchLesson = ({ courseId, moduleIndex, lessonIndex }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const [lesson, setLesson] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressState, setProgressState] = useState("setup");
  const [lessonId, setLessonId] = useState(null);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  // Step 1: Resolve lessonId from course structure
  useEffect(() => {
    if (!isAuthenticated || !courseId || moduleIndex === null || lessonIndex === null) {
      return;
    }

    let cancelled = false;

    const resolveLessonId = async () => {
      try {
        setProgressState("setup");

        const courseRes = await api.get(`/course/details/${courseId}`);

        if (cancelled) return;

        const courseData = courseRes.data.course;
        const targetModule = courseData.modules.find(
          (m) => m.moduleIndex === Number(moduleIndex)
        );

        if (!targetModule) throw new Error("Module not found");

        const targetLesson = targetModule.lessons.find(
          (l) => l.lessonIndex === Number(lessonIndex)
        );

        if (!targetLesson) throw new Error("Lesson not found");

        const foundLessonId = targetLesson._id.toString();
        
        if (!cancelled) {
          setLessonId(foundLessonId);
          setShouldGenerate(true);
          setProgressState("loading");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to resolve lesson:", err);
          setError("Failed to load lesson");
          setProgressState("failed");
          setLoading(false);
        }
      }
    };

    resolveLessonId();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, courseId, moduleIndex, lessonIndex]);

  // Step 2: Use the lesson generation hook to load/generate
  const { data: generatedLesson, loading: generating } = useGenerateLesson(
    isAuthenticated,
    lessonId,
    shouldGenerate
  );

  // Step 3: Handle generated/loaded lesson data
  useEffect(() => {
    if (generatedLesson) {
      console.log("=== useFetchLesson - generatedLesson received ===");
      console.log("generatedLesson:", generatedLesson);

      // Unwrap the lesson data properly.
      // The backend may return data in several nested forms:
      //   - generatedLesson.content.lesson.opening  (triple-nested)
      //   - generatedLesson.content.opening          (double-nested)
      //   - generatedLesson.opening                  (flat)
      // We need to normalize so LessonViewer sees { title, description, content: { opening, coreExplanation, ... } }

      let title = generatedLesson.title;
      let description = generatedLesson.description;
      let content = generatedLesson.content;
      let youtubeQuery = generatedLesson.youtubeQuery;

      // If content itself has a nested "lesson" key with the actual section data, unwrap it
      if (content && content.lesson && typeof content.lesson === "object") {
        // content.lesson contains { opening, coreExplanation, theTrap, verification, mcqs, closing, youtubeQuery }
        const innerLesson = content.lesson;
        // Preserve title/description from outer level if available, fallback to content level
        title = title || content.title;
        description = description || content.description;
        // The youtubeQuery with videos may be at content level, inner level, or both
        youtubeQuery = content.youtubeQuery || innerLesson.youtubeQuery || youtubeQuery;
        // The actual sections are in innerLesson
        content = innerLesson;
      }

      const normalizedLesson = {
        title,
        description,
        content,
        youtubeQuery,
      };

      console.log("normalizedLesson:", normalizedLesson);
      setLesson(normalizedLesson);
      setYoutubeVideos(youtubeQuery?.videos || []);
      
      setLoading(false);
      setProgressState("completed");
      setShouldGenerate(false);
    }
  }, [generatedLesson]);

  // Update loading state when generation is happening
  useEffect(() => {
    if (generating) {
      setProgressState("finalizing");
    }
  }, [generating]);

  return {
    lesson,
    youtubeVideos,
    loading: loading || generating,
    error,
    progressState,
  };
};

export default useFetchLesson;
