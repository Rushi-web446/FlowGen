import Section from "./Section";
// components/lesson/LessonSummary.jsx
const LessonSummary = ({ summary }) => {
  if (!summary || summary.length === 0) return null;

  return (
    <Section title="Summary">
      {/* <ul>
        {summary.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ul> */}

      {summary}
    </Section>
  );
};

export default LessonSummary;
