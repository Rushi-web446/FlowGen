import Section from "./Section";

const LessonPractice = ({ task }) => {
  if (!task?.title) return null;

  return (
    <Section title="Portfolio Practice" id="practice">
      <div className="lesson-intro-box">
        <p><strong>{task.title}</strong></p>
        <p>{task.instructions}</p>
        {task.deliverable && <p><strong>Deliverable:</strong> {task.deliverable}</p>}
      </div>
    </Section>
  );
};

export default LessonPractice;
