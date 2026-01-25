import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import Course from "./pages/Course";

import LoginRedirect from "./pages/LoginRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseResolver from "./pages/CourseResolve";
function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <h2>Loading...</h2>;

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
      />
      <Route path="/login" element={<LoginRedirect />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

  <Route path="/course/:courseId/resolve" element={<CourseResolver />} />

      <Route
        path="/course/:courseId/module/:moduleIndex/lesson/:lessonIndex"
        element={
          <ProtectedRoute>
            <Course />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
