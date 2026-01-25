// import { useNavigate, useParams } from "react-router-dom";
// import { useAuth0 } from "@auth0/auth0-react";
// import { useEffect, useRef, useState } from "react";
// import api from "../api/axios";

// import html2pdf from "html2pdf.js";
// import LessonPDF from "../components/lesson/LessonPDF";
// import LessonViewer from "../components/lesson/LessonViewer";
// import CourseSidebar from "../components/layout/CourseSidebar";

// import useFetchLesson from "../hooks/useFetchLesson";

// const Course = () => {
//   const navigate = useNavigate();
//   const { courseId, moduleIndex, lessonIndex } = useParams();
//   const { isAuthenticated, getAccessTokenSilently } = useAuth0();
//   const pdfRef = useRef();

//   const [lesson, setLesson] = useState(null);
//   const [youtubeVideos, setYoutubeVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");


// const { lesson, youtubeVideos, loading, error } = useFetchLesson({
//   courseId,
//   moduleIndex,
//   lessonIndex,
// });



//   const onCompleteAndNext = async () => {
//     try {
//       const token = await getAccessTokenSilently();

//       await api.post(
//         `/course/complete/lesson/${courseId}`,
//         {
//           moduleIndex: Number(moduleIndex),
//           lessonIndex: Number(lessonIndex),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // We don't alert anymore, just resolve the next step
//       navigate(`/course/${courseId}/resolve`, { replace: true });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to complete lesson");
//     }
//   };


//   // 📄 PDF Download
//   const downloadPDF = () => {
//     html2pdf()
//       .set({
//         margin: 0.5,
//         filename: `${lesson?.title || 'lesson'}.pdf`,
//         html2canvas: { scale: 2 },
//         jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//       })
//       .from(pdfRef.current)
//       .save();
//   };



//   // ⏳ Loading
//   if (loading) {
//     return (
//       <div style={{ display: 'flex', height: '100vh', background: '#020617', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
//         <h2>Loading lesson…</h2>
//       </div>
//     );
//   }

//   // ❌ Error
//   if (error) {
//     return (
//       <div style={{ display: 'flex', height: '100vh', background: '#020617', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
//         <h2>{error}</h2>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>
//       {/* Sidebar - Course Syllabus */}
//       <CourseSidebar
//         currentModuleIndex={moduleIndex}
//         currentLessonIndex={lessonIndex}
//       />

//       {/* Main Content Area */}
//       <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>

//         {/* Top Header Actions */}
//         <div style={{
//           padding: "1rem 2rem",
//           borderBottom: "1px solid rgba(255,255,255,0.1)",
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: "1rem",
//           background: "rgba(15, 23, 42, 0.4)",
//           backdropFilter: "blur(10px)",
//           position: "sticky",
//           top: 0,
//           zIndex: 10
//         }}>
//           <button
//             onClick={downloadPDF}
//             style={{
//               padding: "8px 16px",
//               borderRadius: "8px",
//               background: "rgba(255,255,255,0.05)",
//               color: "#e2e8f0",
//               border: "1px solid rgba(255,255,255,0.1)",
//               cursor: "pointer",
//               fontSize: "0.875rem",
//               transition: "all 0.2s"
//             }}
//           >
//             📄 Download PDF
//           </button>
//           <button
//             onClick={onCompleteAndNext}
//             style={{
//               padding: "8px 16px",
//               borderRadius: "8px",
//               background: "#6366f1",
//               color: "white",
//               border: "none",
//               cursor: "pointer",
//               fontSize: "0.875rem",
//               fontWeight: "600",
//               boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
//             }}
//           >
//             ✅ Complete & Next
//           </button>
//         </div>

//         {/* Lesson Content Container */}
//         <div style={{ padding: "0 2rem 4rem 2rem" }}>
//           {/* Hidden PDF content */}
//           <div style={{ display: "none" }}>
//             <LessonPDF
//               ref={pdfRef}
//               lesson={lesson}
//               youtubeVideos={youtubeVideos}
//             />
//           </div>

//           {!lesson ? (
//             <div style={{ padding: "4rem", textAlign: "center" }}>
//               <h2 style={{ color: "#94a3b8" }}>Lesson not found</h2>
//             </div>
//           ) : (
//             <LessonViewer lesson={lesson} youtubeVideos={youtubeVideos} />
//           )}

//           {/* Footer Completion (Optional redundancy or main trigger) */}
//           <div style={{
//             marginTop: "4rem",
//             padding: "2rem",
//             borderTop: "1px solid rgba(255,255,255,0.1)",
//             textAlign: "center"
//           }}>
//             <h3 style={{ color: "#f8fafc", marginBottom: "1.5rem" }}>Finished this lesson?</h3>
//             <button
//               onClick={onCompleteAndNext}
//               style={{
//                 padding: "12px 32px",
//                 borderRadius: "12px",
//                 background: "#6366f1",
//                 color: "white",
//                 border: "none",
//                 cursor: "pointer",
//                 fontSize: "1rem",
//                 fontWeight: "600",
//                 boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
//               }}
//             >
//               Mark as Completed & Continue
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Course;








import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useRef } from "react";
import html2pdf from "html2pdf.js";

import LessonPDF from "../components/lesson/LessonPDF";
import LessonViewer from "../components/lesson/LessonViewer";
import CourseSidebar from "../components/layout/CourseSidebar";

import useFetchLesson from "../hooks/useFetchLesson";
import api from "../api/axios";

const Course = () => {
  const navigate = useNavigate();
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const pdfRef = useRef(null);

  // ✅ ONLY SOURCE OF TRUTH FOR LESSON DATA
  const {
    lesson,
    youtubeVideos,
    loading,
    error,
  } = useFetchLesson({
    courseId,
    moduleIndex,
    lessonIndex,
  });



  const onCompleteAndNext = async () => {
    try {
      const token = await getAccessTokenSilently();

      await api.post(
        `/course/complete/lesson/${courseId}`,
        {
          moduleIndex: Number(moduleIndex),
          lessonIndex: Number(lessonIndex),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/course/${courseId}/resolve`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to complete lesson");
    }
  };

  // 📄 PDF Download
  const downloadPDF = () => {
    if (!lesson) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${lesson?.title || "lesson"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(pdfRef.current)
      .save();
  };

  // ⏳ Loading Screen
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Loading lesson…</h2>
      </div>
    );
  }

  // ❌ Error Screen
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>
      {/* Sidebar */}
      <CourseSidebar
        currentModuleIndex={Number(moduleIndex)}
        currentLessonIndex={Number(lessonIndex)}
      />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={downloadPDF}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            📄 Download PDF
          </button>

          <button
            onClick={onCompleteAndNext}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
            }}
          >
            ✅ Complete & Next
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "0 2rem 4rem 2rem" }}>
          {/* Hidden PDF */}
          <div style={{ display: "none" }}>
            <LessonPDF
              ref={pdfRef}
              lesson={lesson}
              youtubeVideos={youtubeVideos}
            />
          </div>

          {!lesson ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <h2 style={{ color: "#94a3b8" }}>Lesson not found</h2>
            </div>
          ) : (
            <LessonViewer
              lesson={lesson}
              youtubeVideos={youtubeVideos}
            />
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: "4rem",
              padding: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#f8fafc", marginBottom: "1.5rem" }}>
              Finished this lesson?
            </h3>

            <button
              onClick={onCompleteAndNext}
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                background: "#6366f1",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
              }}
            >
              Mark as Completed & Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;
