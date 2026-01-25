import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../api/axios';
import './CourseSidebar.css';

const CourseSidebar = ({ currentModuleIndex, currentLessonIndex }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseStructure = async () => {
            if (!isAuthenticated || !courseId) return;
            try {
                const token = await getAccessTokenSilently();
                const res = await api.get(`/course/details/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourseData(res.data.course);
            } catch (err) {
                console.error("Failed to fetch course structure:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseStructure();
    }, [courseId, isAuthenticated, getAccessTokenSilently]);

    if (loading) return <aside className="course-sidebar">Loading syllabus...</aside>;
    if (!courseData) return null;

    // Calculate overall progress
    const allLessons = courseData.modules.flatMap(m => m.lessons);
    const completedLessons = allLessons.filter(l => l.isCompleted).length;
    const progressPercentage = allLessons.length > 0
        ? Math.round((completedLessons / allLessons.length) * 100)
        : 0;

    return (
        <aside className="course-sidebar">
            <div className="sidebar-header">
                <Link to="/home" className="course-back-btn">
                    <span>←</span> Back to Dashboard
                </Link>
                <h2 className="sidebar-title">{courseData.title}</h2>
            </div>

            <div className="sidebar-content">
                {courseData.modules.map((module) => (
                    <div key={module._id} className="module-group">
                        <h3 className="module-title">{module.title}</h3>
                        <div className="lesson-list">
                            {module.lessons.map((lesson) => {
                                const isActive = Number(currentModuleIndex) === module.moduleIndex &&
                                    Number(currentLessonIndex) === lesson.lessonIndex;

                                return (
                                    <div
                                        key={lesson._id}
                                        className={`lesson-item ${isActive ? 'active' : ''} ${lesson.isCompleted ? 'completed' : ''}`}
                                        onClick={() => navigate(`/course/${courseId}/module/${module.moduleIndex}/lesson/${lesson.lessonIndex}`)}
                                    >
                                        <div className="lesson-status-icon">
                                            {lesson.isCompleted ? '✓' : ''}
                                        </div>
                                        <div className="lesson-info">
                                            <span className="lesson-name">{lesson.title}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="progress-card">
                    <div className="progress-label">
                        <span>Course Progress</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CourseSidebar;
