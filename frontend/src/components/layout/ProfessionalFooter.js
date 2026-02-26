import "./ProfessionalFooter.css";

const ProfessionalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="professional-footer">
      <div className="footer-content">
        <div className="footer-section footer-section-left">
          <p className="footer-text">
            <span className="footer-label">created by</span>
            <span className="creator-name">Rushi Danidhariya</span>
          </p>
          <p className="footer-subtext">Building intelligent learning experiences</p>
        </div>

        <div className="footer-section footer-section-right">
          <p className="footer-copyright">© {currentYear} All rights reserved</p>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <p className="footer-tagline">Transforming education through intelligent course generation</p>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
