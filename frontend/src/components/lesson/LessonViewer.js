// components/lesson/LessonViewer.jsx
import "./LessonViewer.css";
import LessonHero from "./LessonHero";
import LessonNavigation from "./LessonNavigation";
import LessonYouTubeSection from "./LessonYouTube";
import Section from "./Section";
import LessonMCQs from "./LessonMCQs";
import { useState } from "react";

const LessonViewer = ({ lesson, youtubeVideos }) => {
  console.log("=== LessonViewer Component ===");
  console.log("1. lesson prop:", lesson);
  console.log("2. lesson.content:", lesson.content);
  console.log("3. youtubeVideos prop:", youtubeVideos);
  
  if (!lesson) return null;

  // The lesson sections are directly in lesson.content!
  const content = lesson.content || lesson;
  
  console.log("4. content.opening:", content.opening);
  console.log("5. content.coreExplanation:", content.coreExplanation);
  console.log("6. content.mcqs:", content.mcqs);

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

      <LessonYouTubeSection videos={youtubeVideos} />

      {content.mcqs && <LessonMCQs mcqs={content.mcqs} />}

      {content.closing && (
        <Section title="Summary">
          <p>{content.closing.youCanNow}</p>
          <p><strong>What's Next:</strong> {content.closing.whatsNext}</p>
        </Section>
      )}

    </div>
  );
};

export default LessonViewer;
