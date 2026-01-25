// import { useEffect, useState } from "react";
// import api from "../api/axios";

// const useSaveLesson = (
//   isAuthenticated,
//   getAccessTokenSilently,
//   courseId,
//   moduleIndex,
//   lessonIndex,
//   lessonData,
//   lessonExists // 👈 NEW PARAM
// ) => {
//   const [saved, setSaved] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // 🔒 HARD STOP CONDITIONS
// if (
//   !isAuthenticated ||
//   !courseId ||
//   moduleIndex === undefined ||
//   lessonIndex === undefined ||
//   !lessonData ||
//   lessonExists ||
//   saved
// ) {
//   return;
// }
//     const save = async () => {
//       try {
//         setLoading(true);
//         const token = await getAccessTokenSilently();

//         await api.post(
//           "/course/save/lesson",
//           {
//             courseId,
//             moduleIndex,
//             lessonIndex,
//             lesson: lessonData,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setSaved(true);
//       } catch (err) {
//         console.error("Saving lesson failed:", err);
//         setError("Failed to save lesson");
//       } finally {
//         setLoading(false);
//       }
//     };

//     save();
//   }, [
//     isAuthenticated,
//     getAccessTokenSilently,
//     courseId,
//     moduleIndex,
//     lessonIndex,
//     lessonData,
//     lessonExists,
//     saved,
//   ]);

//   return { saved, loading, error };
// };

// export default useSaveLesson;



import { useEffect, useState } from "react";
import api from "../api/axios";

const useSaveLesson = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex,
  lessonData,
  lessonExists // 👈 NEW PARAM
) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🔒 HARD STOP CONDITIONS
if (
  !isAuthenticated ||
  !courseId ||
  moduleIndex === undefined ||
  lessonIndex === undefined ||
  !lessonData ||
  lessonExists ||
  saved
) {
  return;
}
    const save =  () => {
      try {
        setLoading(true);
        const token =  getAccessTokenSilently();

         api.post(
          "/course/save/lesson",
          {
            courseId,
            moduleIndex,
            lessonIndex,
            lesson: lessonData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSaved(true);
      } catch (err) {
        console.error("Saving lesson failed:", err);
        setError("Failed to save lesson");
      } finally {
        setLoading(false);
      }
    };

    save();
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    courseId,
    moduleIndex,
    lessonIndex,
    lessonData,
    lessonExists,
    saved,
  ]);

  return { saved, loading, error };
};

export default useSaveLesson;