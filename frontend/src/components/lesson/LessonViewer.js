// components/lesson/LessonViewer.jsx
import "./LessonViewer.css";
import LessonHero from "./LessonHero";
import LessonNavigation from "./LessonNavigation";
import LessonYouTubeSection from "./LessonYouTube";
import Section from "./Section";
import LessonMCQs from "./LessonMCQs";
import LessonResources from "./LessonResources";
import LessonPractice from "./LessonPractice";
import TutorChat from "./TutorChat";

const LessonViewer = ({ lesson, youtubeVideos, onQuizScore, courseId, moduleId }) => {
  
  if (!lesson) return null;

  // The lesson sections are directly in lesson.content!
  const content = lesson.content || lesson;
  

  return (
    <div className="lesson-container">
      <LessonNavigation />

      <LessonHero
        title={lesson.title}
        description={lesson.description}
      />

      {content.opening && (
        <Section title="Introduction" id="introduction">
          <div className="lesson-intro-box">
            <p><strong>The Problem:</strong> {content.opening.theProblem}</p>
            <p><strong>The Promise:</strong> {content.opening.thePromise}</p>
          </div>
        </Section>
      )}

      {content.coreExplanation && (
        <Section title="Core Explanation" id="core-explanation">
          <div className="lesson-point-wrapper">
            <h4 className="lesson-point-heading">In Plain English</h4>
            <p className="lesson-point-text">{content.coreExplanation.inPlainEnglish}</p>
          </div>
          {content.coreExplanation.example && (
            <div className="lesson-example-card">
              <strong>Example</strong>
              <pre style={{ 
                background: "rgba(255,255,255,0.05)", 
                padding: "1rem", 
                borderRadius: "8px", 
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowX: "hidden" 
              }}>
                {content.coreExplanation.example}
              </pre>
            </div>
          )}
          <div className="lesson-point-wrapper">
            <h4 className="lesson-point-heading">Why It Works</h4>
            <p className="lesson-point-text">{content.coreExplanation.whyItWorks}</p>
          </div>
        </Section>
      )}

      {content.theTrap && (
        <Section title="Common Pitfalls" id="common-pitfalls">
          <div className="lesson-intro-box">
            <p><strong>What Beginners Think:</strong> {content.theTrap.whatBeginnersThink}</p>
            <p><strong>Why That's Wrong:</strong> {content.theTrap.whyWrong}</p>
            <p><strong>The Fix:</strong> {content.theTrap.theFix}</p>
          </div>
        </Section>
      )}

      {content.verification && (
        <Section title="Verification" id="verification">
          <div className="lesson-intro-box">
            <p><strong>Check Yourself:</strong> {content.verification.checkYourself}</p>
            <p><strong>Quick Test:</strong> {content.verification.quickTest}</p>
          </div>
        </Section>
      )}

      <LessonPractice task={lesson.handsOnTask || content.handsOnTask} />

      <LessonResources resources={lesson.resources || content.resources} />

      {lesson.retrievalCitations?.length > 0 && <Section title="Sources">
        <ul>{lesson.retrievalCitations.map((citation) => <li key={citation.sourceId}>{citation.url ? <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a> : citation.title}</li>)}</ul>
      </Section>}

      <Section title="Why this lesson?">
        <p>{lesson.description || content.opening?.thePromise || "This lesson builds the skill needed for the next part of your course."}</p>
      </Section>

      <LessonYouTubeSection videos={youtubeVideos} />

      {content.mcqs && <LessonMCQs mcqs={content.mcqs} onScoreChange={onQuizScore} />}

      {content.closing && (
        <Section title="Summary">
          <p>{content.closing.youCanNow}</p>
          <p><strong>What's Next:</strong> {content.closing.whatsNext}</p>
        </Section>
      )}

      <TutorChat courseId={courseId} moduleId={moduleId} lesson={lesson} />

    </div>
  );
};

export default LessonViewer;
