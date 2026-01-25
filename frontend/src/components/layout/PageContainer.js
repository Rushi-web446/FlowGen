const PageContainer = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #111827, #020617)",
      padding: "4rem 1rem",
      display: "flex",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export default PageContainer;
