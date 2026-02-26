import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const MyCourse = ({ isAuthenticated, getAccessTokenSilently }) => {
  const containerStyle = {
    marginTop: "2.5rem",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
  };

  const titleStyle = {
    color: "#e5e7eb",
    fontSize: "1.6rem",
    marginBottom: "1.5rem",
  };

  const infoText = {
    color: "rgba(229,231,235,0.6)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
  };

  const cardStyle = {
    padding: "1rem",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "0.2s ease",
  };

  const cardTitle = {
    color: "#ffffff",
    marginBottom: "0.5rem",
  };

  const cardDesc = {
    color: "rgba(229,231,235,0.7)",
    fontSize: "0.9rem",
  };

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  useEffect(() => {
  if (!isAuthenticated) return;

  const fetchRecentCourses = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await api.post(
        "/course/recent",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      setError("Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  fetchRecentCourses();
}, [isAuthenticated, getAccessTokenSilently]);


  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>My Learning Journeys</h2>

      {loading && <p style={infoText}>Loading courses...</p>}

      {error && <p style={{ ...infoText, color: "#ef4444" }}>{error}</p>}

      {!loading && courses.length === 0 && (
        <p style={infoText}>No courses generated yet.</p>
      )}

      {!loading && courses.length > 0 && (
        <div style={gridStyle}>
          {courses.map((course) => (
            <div key={course._id} style={cardStyle}>
              <h3 style={cardTitle}>{course.title}</h3>
              <p style={cardDesc}>{course.description?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourse;
