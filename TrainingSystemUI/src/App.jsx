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
                } />
                <Route path="/roles" element={<Role />} />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <User />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/courses"
                    element={
                        <ProtectedRoute>
                            <Course />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/lessons"
                    element={
                        <ProtectedRoute>
                            <Lesson />
                        </ProtectedRoute>
                    }
                />
                <Route path="/materials" element={<Material />} />
                <Route path="/enrollment" element={<Enrollment />} />    
                <Route path="/exams" element={<Exam />} />     
                <Route path="/questions" element={<Question />} /> 
                <Route path="/ExamResult" element={<ExamResult />} />
            </Routes>

        </BrowserRouter>

    );

}

export default App;