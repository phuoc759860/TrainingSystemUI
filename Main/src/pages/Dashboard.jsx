import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/DashboardService";

function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const [stats, setStats] = useState({});

    useEffect(() => {
        (async () => {
            try {
                const res = await getDashboard();
                setStats(res.data);
            } catch (err) {
                console.log(err);
            }
        })();
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const modules = [
        { label: "Roles", path: "/roles", roles: ["Admin"] },
        { label: "User Management", path: "/users", roles: ["Admin"] },
        { label: "Course Management", path: "/courses", roles: ["Admin", "Trainer", "Student"] },
        { label: "Lessons", path: "/lessons", roles: ["Admin", "Trainer", "Student"] },
        { label: "Materials", path: "/materials", roles: ["Admin", "Trainer", "Student"] },
        { label: "Enrollment Management", path: "/enrollment", roles: ["Admin", "Trainer"] },
        { label: "Exams", path: "/exams", roles: ["Admin", "Trainer", "Student"] },
        { label: "Question Bank", path: "/questions", roles: ["Admin", "Trainer"] },
        { label: "Exam Results", path: "/ExamResult", roles: ["Admin", "Trainer"] },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>Welcome back, {name}</h2>
                    <p style={{ color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        {email} · <span className="badge badge-success">{role}</span>
                    </p>
                </div>
                <button className="btn btn-danger" onClick={logout}>Logout</button>
            </div>

            <div className="stat-grid">
                <div className="stat-card"><div className="num">{stats.totalUsers ?? "–"}</div><div className="label">Users</div></div>
                <div className="stat-card"><div className="num">{stats.totalCourses ?? "–"}</div><div className="label">Courses</div></div>
                <div className="stat-card"><div className="num">{stats.totalLessons ?? "–"}</div><div className="label">Lessons</div></div>
                <div className="stat-card"><div className="num">{stats.totalMaterials ?? "–"}</div><div className="label">Materials</div></div>
                <div className="stat-card"><div className="num">{stats.totalExams ?? "–"}</div><div className="label">Exams</div></div>
                <div className="stat-card"><div className="num">{stats.totalEnrollments ?? "–"}</div><div className="label">Enrollments</div></div>
                <div className="stat-card"><div className="num">{stats.totalResults ?? "–"}</div><div className="label">Results</div></div>
            </div>

            <h3 style={{ marginBottom: 14 }}>Modules</h3>
            <div className="module-grid">
                {modules.filter(m => m.roles.includes(role)).map(m => (
                    <button key={m.path} className="module-card" onClick={() => navigate(m.path)}>
                        {m.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
export default Dashboard;