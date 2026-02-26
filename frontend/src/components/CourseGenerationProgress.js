import "./CourseGenerationProgress.css";

const CourseGenerationProgress = ({ progressState }) => {
  const progressMessages = {
    extracting: {
      text: "🔍 Extracting course information...",
      description: "Analyzing your prompt & structuring content",
    },
    generating: {
      text: "✍️ Generating course outline...",
      description: "Creating comprehensive learning path",
    },
    creating: {
      text: "🛠️ Creating course lessons...",
      description: "Setting up all course materials",
    },
    completed: {
      text: "✅ Course ready!",
      description: "Your course has been created successfully",
    },
    failed: {
      text: "❌ Course generation failed",
      description: "Please try again",
    },
  };

  const current = progressMessages[progressState] || progressMessages.extracting;

  return (
    <div className={`course-generation-progress ${progressState}`}>
      <div className="progress-content">
        <p className="progress-text">{current.text}</p>
        <p className="progress-description">{current.description}</p>

        {progressState !== "completed" && progressState !== "failed" && (
          <div className="progress-indicators">
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseGenerationProgress;
