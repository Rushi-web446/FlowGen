import Section from "./Section";
const LessonHeader = ({ lesson, module }) => {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        Module {module.moduleIndex}: {module.title}
      </p>

      <h2
        style={{
          fontSize: "1.8rem",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        Lesson {lesson.lessonIndex}: {lesson.title}
      </h2>

      {lesson.isCompleted && (
        <span
          style={{
            display: "inline-block",
            marginTop: "8px",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            background: "#ecfdf5",
            color: "#047857",
            fontWeight: "500",
          }}
        >
          Completed
        </span>
      )}
    </div>
  );
};

export default LessonHeader;
