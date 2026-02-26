import "./LessonLoadingProgress.css";

const LessonLoadingProgress = ({ progressState }) => {
  const progressMessages = {
    setup: {
      text: "🔍 Setting up lesson...",
      description: "Preparing your learning content",
    },
    loading: {
      text: "📚 Loading content...",
      description: "Retrieving lesson materials and resources",
    },
    finalizing: {
      text: "⏱️ Finalizing lesson...",
      description: "Almost ready, just a moment",
    },
    completed: {
      text: "✅ Lesson ready!",
      description: "Your lesson has been loaded successfully",
    },
    failed: {
      text: "❌ Failed to load lesson",
      description: "Please try again or go back",
    },
  };

  const current = progressMessages[progressState] || progressMessages.setup;

  return (
    <div className={`lesson-loading-progress ${progressState}`}>
      <div className="lesson-progress-content">
        <p className="lesson-progress-text">{current.text}</p>
        <p className="lesson-progress-description">{current.description}</p>

        {progressState !== "completed" && progressState !== "failed" && (
          <div className="lesson-progress-indicators">
            <div className="lesson-progress-dot"></div>
            <div className="lesson-progress-dot"></div>
            <div className="lesson-progress-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonLoadingProgress;
