const ContentCard = ({ children }) => (
  <div
    style={{
      background: "#ffffff",
      width: "100%",
      maxWidth: "820px",
      borderRadius: "16px",
      padding: "3rem",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    }}
  >
    {children}
  </div>
);

export default ContentCard;
