import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Role from "./pages/Role";
import User from "./pages/User";
import Course from "./pages/Courses";
import Lesson from "./pages/Lesson";
import Material from "./pages/Material";
import Enrollment from "./pages/Enrollment";
import Question from "./pages/Question";
import Exam from "./pages/Exams";
import ExamResult from "./pages/ExamResult";
import TakeExam from "./pages/TakeExam";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import "./styles/theme.css";
import "./styles/landing-theme.css";
import "./index.css";
import GradeAttempt from "./pages/GradeAttempt";
import Statistics from "./pages/Statistics";

function ProtectedPage({ children, roles }) {
    return (
        <div className="dashboard-scope">
            <ProtectedRoute roles={roles}>
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            </ProtectedRoute>
        </div>
    );
}

function App() {

    return (

        <BrowserRouter basename="/Education_System">

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
                <Route path="/roles" element={<ProtectedPage roles={["Admin"]}><Role /></ProtectedPage>} />
                <Route path="/users" element={<ProtectedPage roles={["Admin"]}><User /></ProtectedPage>} />
                <Route path="/courses" element={<ProtectedPage roles={["Admin", "Trainer", "Student"]}><Course /></ProtectedPage>} />
                <Route path="/lessons" element={<ProtectedPage roles={["Admin", "Trainer", "Student"]}><Lesson /></ProtectedPage>} />
                <Route path="/materials" element={<ProtectedPage roles={["Admin", "Trainer", "Student"]}><Material /></ProtectedPage>} />
                <Route path="/enrollment" element={<ProtectedPage roles={["Admin", "Trainer"]}><Enrollment /></ProtectedPage>} />
                <Route path="/exams" element={<ProtectedPage roles={["Admin", "Trainer", "Student"]}><Exam /></ProtectedPage>} />
                <Route path="/exams/:examId/take" element={<ProtectedPage roles={["Admin", "Trainer", "Student"]}><TakeExam /></ProtectedPage>} />
                <Route path="/questions" element={<ProtectedPage roles={["Admin", "Trainer"]}><Question /></ProtectedPage>} />
                <Route path="/exam-results" element={<ProtectedPage roles={["Admin", "Trainer"]}><ExamResult /></ProtectedPage>} />
                <Route path="/exam-results/:id/grade" element={<ProtectedPage roles={["Admin", "Trainer"]}><GradeAttempt /></ProtectedPage>} />
                <Route path="/statistics" element={<ProtectedPage roles={["Admin", "Trainer"]}><Statistics /></ProtectedPage>} />
            </Routes>

        </BrowserRouter>

    );

}

export default App;
