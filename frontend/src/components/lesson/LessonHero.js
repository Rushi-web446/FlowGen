// components/lesson/LessonHero.jsx
const LessonHero = ({ title, description }) => {
  return (
    <div className="lesson-hero">
      <h1 className="lesson-title">
        {title}
      </h1>
      <p className="lesson-description">
        {description}
      </p>
    </div>
  );
};

export default LessonHero;
