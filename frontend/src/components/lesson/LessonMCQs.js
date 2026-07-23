import Section from "./Section";
import { useState } from "react";

const LessonMCQs = ({ mcqs, onScoreChange }) => {
  const [, setResults] = useState({});

  if (!mcqs || mcqs.length === 0) return null;

  const handleResult = (index, isCorrect) => {
    setResults((currentResults) => {
      if (currentResults[index] !== undefined) return currentResults;
      const nextResults = { ...currentResults, [index]: isCorrect };
      if (Object.keys(nextResults).length === mcqs.length) {
        const correctAnswers = Object.values(nextResults).filter(Boolean).length;
        onScoreChange?.(Math.round((correctAnswers / mcqs.length) * 100));
      }
      return nextResults;
    });
  };

  return (
    <Section title="Check Your Understanding" id="mcqs">
      {mcqs.map((q, idx) => (
        <MCQItem key={idx} index={idx} question={q} onResult={handleResult} />
      ))}
    </Section>
  );
};

const MCQItem = ({ index, question, onResult }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (selectedOption !== null) {
      setShowResult(true);
      onResult(index, selectedOption === question.correctIndex);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="lesson-mcq-item">
      <p className="lesson-mcq-question">{index + 1}. {question.question}</p>

      <ul className="lesson-mcq-list">
        {question.options.map((opt, i) => (
          <li
            key={i}
            className={`lesson-mcq-option ${selectedOption === i ? "selected" : ""
              } ${showResult && i === question.correctIndex ? "correct" : ""
              } ${showResult && selectedOption === i && i !== question.correctIndex ? "incorrect" : ""
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
