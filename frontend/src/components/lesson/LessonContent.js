import Section from "./Section";

// src/components/lesson/LessonContent.jsx
const LessonContent = ({ content }) => {
  if (!content) return null;

  return (
    <div style={{ lineHeight: "1.7", color: "#374151" }}>
      {content.introduction && (
        <Section title="Introduction">
          <p>{content.introduction}</p>
        </Section>
      )}

      {content.concepts && content.concepts.length > 0 && (
        <Section title="Key Concepts">
          <ul>
            {content.concepts.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {content.examples && content.examples.length > 0 && (
        <Section title="Examples">
          {content.examples.map((ex, idx) => (
            <p key={idx}>• {ex}</p>
          ))}
        </Section>
      )}

      {content.summary && (
        <Section title="Summary">
          <p>{content.summary}</p>
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: "1.5rem" }}>
    <h3
      style={{
        fontSize: "1.2rem",
        fontWeight: "600",
        marginBottom: "0.5rem",
        color: "#111827",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

export default LessonContent;
