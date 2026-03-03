import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseRoadmap.css';

const CourseRoadmap = ({ courseData, isOpen, onClose, currentModuleIndex, currentLessonIndex }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  if (!isOpen || !courseData) return null;

  const allLessons = courseData.modules.flatMap(m => m.lessons);
  const completedLessons = allLessons.filter(l => l.isCompleted).length;
  const progressPercentage = allLessons.length > 0
    ? Math.round((completedLessons / allLessons.length) * 100)
    : 0;

  const handleLessonClick = (module, lesson) => {
    navigate(`/course/${courseId}/module/${module.moduleIndex}/lesson/${lesson.lessonIndex}`);
    // Do NOT call onClose() here — that would redirect to home from CourseOverview
  };

  return (
    <>
      <div className="roadmap-overlay" onClick={onClose}></div>

      <div className="roadmap-modal">
        <div className="roadmap-header">
          <div>
            <h2 className="roadmap-title">{courseData.title}</h2>
            <p className="roadmap-subtitle">Course Roadmap & Progress</p>
          </div>
          <button className="roadmap-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="roadmap-progress-section">
          <div className="progress-info">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-percentage">{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span className="stat">
              ✓ <strong>{completedLessons}</strong> Completed
            </span>
            <span className="stat">
              → <strong>{allLessons.length - completedLessons}</strong> Remaining
            </span>
          </div>
        </div>

        <div className="roadmap-content">
          <div className="modules-grid">
            {courseData.modules.map((module, idx) => {
              const moduleCompletedCount = module.lessons.filter(l => l.isCompleted).length;
              const moduleProgressPercent = module.lessons.length > 0
                ? Math.round((moduleCompletedCount / module.lessons.length) * 100)
                : 0;
              const isCurrentModule = Number(currentModuleIndex) === module.moduleIndex;

              return (
                <div key={module._id} className={`module-card ${isCurrentModule ? 'current-module' : ''}`}>
                  <div className="module-card-header">
                    <h3 className="module-name">
                      Module {module.moduleIndex}
                    </h3>
                    <div className="module-progress-badge">
                      {moduleProgressPercent}%
                    </div>
                  </div>

                  <h4 className="module-title">{module.title}</h4>

                  <div className="module-progress-bar">
                    <div
                      className="module-progress-fill"
                      style={{ width: `${moduleProgressPercent}%` }}
                    ></div>
                  </div>

                  <div className="lessons-container">
                    {module.lessons.map((lesson, lessonIdx) => {
                      const isCurrentLesson =
                        Number(currentModuleIndex) === module.moduleIndex &&
                        Number(currentLessonIndex) === lesson.lessonIndex;

                      return (
                        <div
                          key={lesson._id}
                          className={`lesson-node ${isCurrentLesson ? 'current' : ''}`}
                          onClick={() => handleLessonClick(module, lesson)}
                          title={lesson.title}
                        >
                          <span className={`lesson-icon ${isCurrentLesson ? 'current' : ''}`}>
                            {isCurrentLesson ? '▶' : lesson.lessonIndex}
                          </span>

                          <div className="lesson-details">
                            <span className="lesson-node-title">{lesson.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="roadmap-legend">
          <div className="legend-item">
            <span className="legend-icon current">▶</span>
            <span>Current Lesson</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseRoadmap;
