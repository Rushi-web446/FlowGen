import Section from "./Section";
const LessonSummary = ({ summary }) => {
  if (!summary || summary.length === 0) return null;

  return (
    <Section title="Summary">

      {summary}
    </Section>
  );
};

export default LessonSummary;
