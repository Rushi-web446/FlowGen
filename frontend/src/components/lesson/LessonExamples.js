import Section from "./Section";
// components/lesson/LessonExamples.jsx
const LessonExamples = ({ examples }) => {
  if (!examples || examples.length === 0) return null;

  return (
    <Section title="Worked Examples" id="worked-examples">
      {examples.map((ex, idx) => (
        <div
          key={idx}
          className="lesson-example-card"
        >
          <strong>{ex.title}</strong>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{ex.content}</p>
        </div>
      ))}
    </Section>
  );
};

export default LessonExamples;
