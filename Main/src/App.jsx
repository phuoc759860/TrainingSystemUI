import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Role from "./pages/Role";
import User from "./pages/User";
import Course from "./pages/Courses";
import Lesson from "./pages/Lesson";
import Material from "./pages/Material";
import Enrollment from "./pages/Enrollment";
import Exam from "./pages/Exams";
import Question from "./pages/Question";
import ExamResult from "./pages/ExamResult";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/theme.css";
import "./index.css";

function App() {

    return (

        <BrowserRouter>

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* FIX: this route had no ProtectedRoute wrapper at all before */}
                <Route
                    path="/roles"
                    element={
                        <ProtectedRoute roles={["Admin"]}>
                            <Role />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute roles={["Admin"]}>
                            <User />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/courses"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer", "Student"]}>
                            <Course />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/lessons"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer", "Student"]}>
                            <Lesson />
                        </ProtectedRoute>
                    }
                />

                {/* FIX: these five routes had no ProtectedRoute wrapper at all before */}
                <Route
                    path="/materials"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer", "Student"]}>
                            <Material />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/enrollment"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer"]}>
                            <Enrollment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/exams"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer", "Student"]}>
                            <Exam />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/questions"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer"]}>
                            <Question />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ExamResult"
                    element={
                        <ProtectedRoute roles={["Admin", "Trainer"]}>
                            <ExamResult />
                        </ProtectedRoute>
                    }
                />
            </Routes>

        </BrowserRouter>

    );

}

export default App;