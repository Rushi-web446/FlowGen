// components/lesson/LessonNavigation.jsx
import { useState } from "react";

const LessonNavigation = () => {
    const [activeSection, setActiveSection] = useState("");

    const sections = [
        { id: "introduction", label: "Introduction" },
        { id: "core-concepts", label: "Core Concepts" },
        { id: "worked-examples", label: "Example" },
        { id: "watch", label: "Watch & Reinforce" },
        { id: "mcqs", label: "Quiz" },
    ];

    const handleScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
        }
    };

    return (
        <nav className="lesson-nav">
            <ul className="lesson-nav-list">
                {sections.map((sec) => (
                    <li
                        key={sec.id}
                        className={`lesson-nav-item ${activeSection === sec.id ? "active" : ""}`}
                        onClick={() => handleScroll(sec.id)}
                    >
                        {sec.label}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default LessonNavigation;
