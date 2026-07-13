import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const role = localStorage.getItem("role");

    const name = localStorage.getItem("name");

    const email = localStorage.getItem("email");
    
    const roleID = localStorage.getItem("roleID");

    const [stats, setStats] = useState({});

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const res = await getDashboard();

                setStats(res.data);

            }
            catch (err) {

                console.log(err);

            }

        };

        loadDashboard();

    }, []);

    const logout = () => {

        localStorage.clear();

        navigate("/");

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>Training System</h1>

            <hr />

            <h2>
                Welcome {name}
            </h2>

            <p>
                Email: {email}
            </p>

            <p>
                Role: {role}
            </p>

            <hr />

            <h3>System Statistics</h3>

            <p>Total Users: {stats.totalUsers}</p>

            <p>Total Courses: {stats.totalCourses}</p>

            <p>Total Lessons: {stats.totalLessons}</p>

            <p>Total Materials: {stats.totalMaterials}</p>

            <p>Total Exams: {stats.totalExams}</p>

            <p>Total Enrollments: {stats.totalEnrollments}</p>

            <p>Total Results: {stats.totalResults}</p>

            <hr />

            <h3>Modules</h3>

            {role === "Admin" && (
                <button onClick={() => navigate("/roles")}>
                    Roles
                </button>
            )}

            <br /><br />

            {role === "Admin" && (
                <button onClick={() => navigate("/users")}>
                    User Management
                </button>
            )}

            <br /><br />

                <button onClick={() => navigate("/courses")}>
                    Course Management
                </button>

            <br /><br />

            <button 
                onClick={() => navigate("/lessons")}
                style ={{ background: "cyan", color: "black" }}
                >Lessons
            </button>

            <br /><br />

            <button onClick={() => navigate("/materials")}>
                Materials
            </button>

            <br /><br />

            <button onClick={() => navigate("/enrollment")}>
                Enrollment Management
            </button>

            <br /><br />

            <button onClick={() => navigate("/exams")}>
                Exams
            </button>

            <br /><br />

            {(role === "Admin" || role === "Trainer") && (
                <button onClick={() => navigate("/questions")}>
                    Question Bank
                </button>
            )}

            <br /><br />

            <button onClick={() => navigate("/ExamResult")}>
                Exam Results
            </button>

            <br /><br /><br />

            <button
                style={{ background: "red", color: "white" }}
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );

}

export default Dashboard;