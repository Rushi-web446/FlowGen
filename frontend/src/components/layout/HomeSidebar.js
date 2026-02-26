import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './HomeSidebar.css';

const HomeSidebar = ({ isOpen, onClose, recentCourses, loading }) => {
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}/module/1/lesson/1`);
    onClose();
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`home-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="home-sidebar-header">
          <h2>Your Courses</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="home-sidebar-content">
          <div className="sidebar-section">
            <h3 className="section-title">Recent Courses</h3>
            {loading && <p className="loading-text">Loading courses...</p>}
            {!loading && recentCourses.length === 0 && (
              <p className="empty-text">No courses yet</p>
            )}

            {!loading && recentCourses.length > 0 && (
              <div className="courses-list">
                {recentCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.courseId}
                    className="course-item"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
                    <h4>{course.courseTitle}</h4>
                    <p>{course.courseDescription}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="home-sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default HomeSidebar;
