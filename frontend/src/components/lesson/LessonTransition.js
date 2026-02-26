import "./LessonTransition.css";

const LessonTransition = () => {
  const messages = [
    {
      text: "✅ Lesson Completed!",
      subtext: "Congratulations on finishing this lesson",
    },
    {
      text: "🎯 Finding Your Next Challenge",
      subtext: "Retrieving the next lesson in your learning path",
    },
    {
      text: "📚 Preparing Sequential Content",
      subtext: "Loading your next lesson to maintain learning continuity",
    },
    {
      text: "⚡ Almost Ready",
      subtext: "Setting up resources and materials for your next lesson",
    },
  ];

  return (
    <div className="lesson-transition-wrapper">
      <div className="lesson-transition-container">
        <div className="transition-progress-circle">
          <div className="transition-circle-inner"></div>
        </div>

        <div className="transition-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`transition-message transition-message-${idx + 1}`}
            >
              <p className="transition-main-text">{msg.text}</p>
              <p className="transition-sub-text">{msg.subtext}</p>
            </div>
          ))}
        </div>

        <div className="transition-footer">
          <p className="transition-motivational">
            🚀 Keep learning, keep growing!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LessonTransition;
