import Section from "./Section";

const LessonIntroduction = ({ introduction }) => (
  <Section title="Introduction" id="introduction">
    <div className="lesson-intro-box">
      {introduction}
    </div>
  </Section>
);

export default LessonIntroduction;
