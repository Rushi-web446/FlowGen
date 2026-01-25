import Section from "./Section";
// components/lesson/LessonResources.jsx
const LessonResources = ({ resources }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <Section title="Suggested Resources">
      <ul>
        {resources.map((r, idx) => (
          <li key={idx}>{r}</li>
        ))}
      </ul>
    </Section>
  );
};

export default LessonResources;
