import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import './HomeSidebar.css';

const HomeSidebar = ({ isOpen, onClose, recentCourses: initialCourses, loading }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [recentCourses, setRecentCourses] = useState(initialCourses || []);
  const [localLoading, setLocalLoading] = useState(false);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  useEffect(() => {
    let mounted = true;
    const loadUserCourses = async () => {
      if (!isOpen) return;
      // if parent provided courses, skip fetch
      if (initialCourses && initialCourses.length > 0) {
        setRecentCourses(initialCourses);
        return;
      }

      try {
        setLocalLoading(true);
        // axios interceptor will automatically add JWT token
        const res = await api.get('/course/course');
        if (mounted && res.data && res.data.courses) {
          setRecentCourses(res.data.courses);
        }
      } catch (err) {
        console.error('Failed to load user courses:', err);
      } finally {
        if (mounted) setLocalLoading(false);
      }
    };

    loadUserCourses();

    return () => {
      mounted = false;
    };
  }, [isOpen, initialCourses]);

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
            {(loading || localLoading) && <p className="loading-text">Loading courses...</p>}
            {!localLoading && !loading && recentCourses?.length === 0 && (
              <p className="empty-text">No courses yet</p>
            )}

            {!localLoading && !loading && recentCourses?.length > 0 && (
              <div className="courses-list">
                {recentCourses.slice(0, 7).map((course) => (
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
