import Section from "./Section";

const LessonObjective = ({ objectives }) => {
    if (!objectives || (Array.isArray(objectives) && objectives.length === 0)) return null;

    return (
        <Section title="Learning Objectives" id="objectives">
            <div className="lesson-objectives-box">
                {Array.isArray(objectives) ? (
                    <ul className="lesson-objectives-list">
                        {objectives.map((obj, idx) => (
                            <li key={idx} className="lesson-objective-item">{obj}</li>
                        ))}
                    </ul>
                ) : (
                    <p>{objectives}</p>
                )}
            </div>
        </Section>
    );
};

export default LessonObjective;
