import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getDashboard } from "../services/DashboardService";

// Counts up from 0 to the target value whenever it changes — used on the
// stat cards so the dashboard feels alive on load instead of just appearing.
function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (value == null) return;

        const target = Number(value) || 0;
        const duration = 700;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(Math.round(target * eased));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value]);

    if (value == null) return <>–</>;
    return <>{display}</>;
}

function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
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

    const modules = [
        { label: "Roles", path: "/roles", roles: ["Admin"] },
        { label: "User Management", path: "/users", roles: ["Admin"] },
        { label: "Course Management", path: "/courses", roles: ["Admin", "Trainer", "Student"] },
        { label: "Lessons", path: "/lessons", roles: ["Admin", "Trainer", "Student"] },
        { label: "Materials", path: "/materials", roles: ["Admin", "Trainer", "Student"] },
        { label: "Enrollment Management", path: "/enrollment", roles: ["Admin", "Trainer"] },
        { label: "Exams", path: "/exams", roles: ["Admin", "Trainer", "Student"] },
        { label: "Question Bank", path: "/questions", roles: ["Admin", "Trainer"] },
        { label: "Exam Results", path: "/exam-results", roles: ["Admin", "Trainer"] },
        { label: "Statistics", path: "/statistics", roles: ["Admin", "Trainer"] },
    ];

    return (
        <div className="page">

            <div className="card" style={{ marginBottom: 32, padding: 0, overflow: "hidden", border: "none", boxShadow: "var(--shadow)" }}>
                <div style={{ background: "var(--gradient-brand)", padding: "30px 32px", color: "#fff" }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 13, opacity: .85, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase" }}>
                            {role}
                        </p>
                        <h2 style={{ margin: "6px 0 0", color: "#fff", fontSize: 28 }}>
                            Welcome back, {name}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalUsers} /></div><div className="label">Users</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalCourses} /></div><div className="label">Courses</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalLessons} /></div><div className="label">Lessons</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalMaterials} /></div><div className="label">Materials</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalExams} /></div><div className="label">Exams</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalEnrollments} /></div><div className="label">Enrollments</div></div>
                <div className="stat-card"><div className="num"><AnimatedNumber value={stats.totalResults} /></div><div className="label">Results</div></div>
            </div>

            <h3 style={{ marginBottom: 14, fontSize: 19 }}>Sections</h3>
            <div className="module-grid">
                {modules.filter(m => m.roles.includes(role)).map(m => (
                    <button key={m.path} className="module-card" onClick={() => navigate(m.path)}>
                        {m.label}
                        <span className="arrow">→</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
export default Dashboard;