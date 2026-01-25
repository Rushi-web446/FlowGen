// components/lesson/LessonViewer.jsx
import "./LessonViewer.css";
import LessonHero from "./LessonHero";
import LessonIntroduction from "./LessonIntroduction";
import LessonMainPoints from "./LessonMainPoints";
import LessonExamples from "./LessonExamples";
import LessonMCQs from "./LessonMCQs";
import LessonObjective from "./LessonObjective";
import LessonExternal from "./LessonExternal";
import LessonSummary from "./LessonSummary";
import LessonNavigation from "./LessonNavigation";
import LessonYouTubeSection from "./LessonYouTube";


const LessonViewer = ({ lesson, youtubeVideos }) => {
  if (!lesson) return null;

  return (
    <div className="lesson-container">
      <LessonNavigation />

      <LessonHero
        title={lesson.title}
        description={lesson.description}
      />

      <LessonObjective objectives={lesson.lessonObjective} />

      <LessonIntroduction introduction={lesson.introduction} />

      <LessonMainPoints points={lesson.mainPoints} />

      <LessonExamples examples={lesson.examples} />

      <LessonYouTubeSection videos={youtubeVideos} />

      <LessonMCQs mcqs={lesson.mcqs} />

      <LessonSummary summary={lesson.summary} />

      <LessonExternal externalLinks={lesson.external} />

    </div>
  );
};

export default LessonViewer;
