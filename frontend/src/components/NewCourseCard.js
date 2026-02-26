import "./NewCourseCard.css";

const NewCourseCard = ({ course, onNavigate }) => {
  return (
    <div className="new-course-card-wrapper">
      <div className="new-course-card" onClick={() => onNavigate(course)}>
        <div className="new-badge">✨ NEW</div>
        <h3 className="new-course-title">{course.courseTitle}</h3>
        <p className="new-course-description">{course.courseDescription}</p>
        <div className="new-course-footer">
          <span className="new-course-cta">Start Learning →</span>
        </div>
      </div>
    </div>
  );
};

export default NewCourseCard;
