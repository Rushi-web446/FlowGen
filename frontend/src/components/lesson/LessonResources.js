import Section from "./Section";
const LessonResources = ({ resources }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <Section title="Suggested Resources">
      <ul>
        {resources.map((r, idx) => (
          <li key={idx}>
            {r.url ? (
              <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
            ) : r.title || r}
            {r.type && ` · ${r.type}`}
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default LessonResources;
