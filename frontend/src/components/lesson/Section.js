const Section = ({ title, children, id }) => (
  <section className="lesson-section" id={id}>
    <h2 className="lesson-section-header">
      {title}
    </h2>

    <div className="lesson-section-content">
      {children}
    </div>
  </section>
);

export default Section;
