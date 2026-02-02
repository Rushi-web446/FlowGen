import Section from "./Section";
const LessonMainPoints = ({ points }) => {
  if (!points || points.length === 0) return null;

  return (
    <Section title="Core Concepts" id="core-concepts">
      {points.map((p, idx) => (
        <div key={idx} className="lesson-point-wrapper">
          <h4 className="lesson-point-heading">
            {p.heading}
          </h4>
          <p className="lesson-point-text">{p.explanation}</p>
        </div>
      ))}
    </Section>
  );
};

export default LessonMainPoints;
