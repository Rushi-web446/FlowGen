import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseResolver from "./pages/CourseResolve";
import CourseOverview from "./pages/CourseOverview";

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <h2>Loading...</h2>;

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/course/:courseId/resolve"
        element={
          <ProtectedRoute>
            <CourseResolver />
          </ProtectedRoute>
        }
      />

      <Route
        path="/course/:courseId"
        element={
          <ProtectedRoute>
            <CourseOverview />
          </ProtectedRoute>
        }
      />

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
