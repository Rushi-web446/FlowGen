// import { useEffect, useState } from "react";
// import api from "../api/axios";

// const useCheckLessonExist = (
//   isAuthenticated,
//   getAccessTokenSilently,
//   courseId,
//   moduleIndex,
//   lessonIndex
// ) => {
//   const [exists, setExists] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

// useEffect(() => {
//   if (
//     !isAuthenticated ||
//     !courseId ||
//     moduleIndex === undefined ||
//     lessonIndex === undefined
//   ) {
//     return;
//   }

//   const checkLesson = async () => {
//     try {
//       setLoading(true);
//       const token = await getAccessTokenSilently();

//       const res = await api.get(
//         `/course/check/lesson/${courseId}`,
//         {
//           params: { moduleIndex, lessonIndex },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setExists(res.data.exists);
//     } catch (err) {
//       setError("Failed to check lesson existence");
//     } finally {
//       setLoading(false);
//     }
//   };

//   checkLesson();
// }, [
//   isAuthenticated,
//   getAccessTokenSilently,
//   courseId,
//   moduleIndex,
//   lessonIndex,
// ]);

//   return { exists, loading, error };
// };

// export default useCheckLessonExist;





import { useEffect, useState } from "react";
import api from "../api/axios";

const useCheckLessonExist = (
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex
) => {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  if (
    !isAuthenticated ||
    !courseId ||
    moduleIndex === undefined ||
    lessonIndex === undefined
  ) {
    return;
  }

  const checkLesson =  () => {
    try {
      setLoading(true);
      const token = getAccessTokenSilently();

      const res = api.get(
        `/course/check/lesson/${courseId}`,
        {
          params: { moduleIndex, lessonIndex },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExists(res.data.exists);
    } catch (err) {
      setError("Failed to check lesson existence");
    } finally {
      setLoading(false);
    }
  };

  checkLesson();
}, [
  isAuthenticated,
  getAccessTokenSilently,
  courseId,
  moduleIndex,
  lessonIndex,
]);

  return { exists, loading, error };
};

export default useCheckLessonExist;
