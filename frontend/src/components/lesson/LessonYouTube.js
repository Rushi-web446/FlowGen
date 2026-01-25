// components/lesson/LessonYouTube.jsx
import Section from "./Section";

const LessonYouTube = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <Section
      id="watch"
      title="Watch & Reinforce"
      subtitle="Strengthen your understanding before moving to the quiz"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.videoId}
            style={{
              background: "#0f172a",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Video */}
            <iframe
              src={video.embedUrl}
              title={video.title}
              allowFullScreen
              loading="lazy"
              style={{
                width: "100%",
                height: "180px",
                border: "none",
              }}
            />

            {/* Meta */}
            <div style={{ padding: "1rem" }}>
              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                  lineHeight: 1.4,
                }}
              >
                {video.title}
              </h4>

              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.7,
                }}
              >
                {video.channel} • {video.views.toLocaleString()} views
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default LessonYouTube;
