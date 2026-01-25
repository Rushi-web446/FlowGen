import Section from "./Section";
import { useState } from "react";

// components/lesson/LessonMCQs.jsx
const LessonMCQs = ({ mcqs }) => {
  if (!mcqs || mcqs.length === 0) return null;

  return (
    <Section title="Check Your Understanding" id="mcqs">
      {mcqs.map((q, idx) => (
        <MCQItem key={idx} index={idx} question={q} />
      ))}
    </Section>
  );
};

// Internal component for handling individual MCQ state
const MCQItem = ({ index, question }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (selectedOption !== null) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  const isCorrect = selectedOption === question.answerIndex;

  return (
    <div className="lesson-mcq-item">
      <p className="lesson-mcq-question">{index + 1}. {question.question}</p>

      <ul className="lesson-mcq-list">
        {question.options.map((opt, i) => (
          <li
            key={i}
            className={`lesson-mcq-option ${selectedOption === i ? "selected" : ""
              } ${showResult && i === question.answerIndex ? "correct" : ""
              } ${showResult && selectedOption === i && i !== question.answerIndex ? "incorrect" : ""
              }`}
            onClick={() => !showResult && setSelectedOption(i)}
          >
            {opt}
          </li>
        ))}
      </ul>

      {!showResult ? (
        <button
          className="lesson-btn-check"
          onClick={handleCheck}
          disabled={selectedOption === null}
        >
          Check Answer
        </button>
      ) : (
        <div className="lesson-mcq-feedback">
          <p className={isCorrect ? "lesson-mcq-success" : "lesson-mcq-error"}>
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </p>
          <div className="lesson-mcq-explanation">
            <strong>Explanation:</strong> {question.explanation}
          </div>
          <button className="lesson-btn-reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonMCQs;
