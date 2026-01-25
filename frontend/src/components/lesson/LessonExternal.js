import Section from "./Section";

const LessonExternal = ({ externalLinks }) => {
    if (!externalLinks || (Array.isArray(externalLinks) && externalLinks.length === 0)) return null;

    return (
        <Section title="Suggested Readings & External Links" id="external-links">
            <div className="lesson-external-links">
                <ul className="lesson-resources-list">
                    {Array.isArray(externalLinks) ? (
                        externalLinks.map((link, idx) => (
                            <li key={idx} className="lesson-external-item">
                                {typeof link === 'object' ? (
                                    <a href={link.URL || link.url} target="_blank" rel="noopener noreferrer" className="lesson-link">
                                        {link.title || link.name || link.URL || link.url}
                                    </a>
                                ) : typeof link === 'string' && (link.startsWith('http://') || link.startsWith('https://')) ? (
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="lesson-link">
                                        {link}
                                    </a>
                                ) : (
                                    <span>{link}</span>
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="lesson-external-item">{externalLinks}</li>
                    )}
                </ul>
            </div>
        </Section>
    );
};

export default LessonExternal;
