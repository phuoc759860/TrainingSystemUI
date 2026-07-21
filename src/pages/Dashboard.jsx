import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getDashboard } from "../services/DashboardService";

function AnimatedNumber({ value, duration = 700 }) {
    const [display, setDisplay] = useState(0);
    const frameRef = useRef(null);
    const prevValue = useRef(value);

    useEffect(() => {
        if (value == null) return;
        const target = Number(value) || 0;
        const startTime = performance.now();
        const startValue = prevValue.current != null ? Number(prevValue.current) : 0;
        prevValue.current = target;

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(startValue + (target - startValue) * eased));
            if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    if (value == null) return <>&ndash;</>;
    return <>{display}</>;
}

const MODULES = [
    { label: "Courses", path: "/courses", icon: "📚", desc: "Manage training courses", roles: ["Admin", "Trainer", "Student"] },
    { label: "Lessons", path: "/lessons", icon: "📖", desc: "Browse lesson content", roles: ["Admin", "Trainer", "Student"] },
    { label: "Materials", path: "/materials", icon: "📎", desc: "View study materials", roles: ["Admin", "Trainer", "Student"] },
    { label: "Exams", path: "/exams", icon: "✅", desc: "Take or manage exams", roles: ["Admin", "Trainer", "Student"] },
    { label: "Enrollment", path: "/enrollment", icon: "📋", desc: "Track enrollments", roles: ["Admin", "Trainer"] },
    { label: "Question Bank", path: "/questions", icon: "❓", desc: "Manage exam questions", roles: ["Admin", "Trainer"] },
    { label: "Exam Results", path: "/exam-results", icon: "📊", desc: "View graded results", roles: ["Admin", "Trainer"] },
    { label: "Statistics", path: "/statistics", icon: "📈", desc: "Performance analytics", roles: ["Admin", "Trainer"] },
    { label: "User Management", path: "/users", icon: "👥", desc: "Manage users & roles", roles: ["Admin"] },
    { label: "Roles", path: "/roles", icon: "🔑", desc: "Configure role permissions", roles: ["Admin"] },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

function formatTime() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getDashboard();
                setStats(res.data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        })();
    }, []);

    const greeting = getGreeting();
    const today = formatTime();

    const statCards = [
        { key: "totalUsers", label: "Users", gradient: "stat-card-purple", icon: "👥", roles: ["Admin"] },
        { key: "totalCourses", label: "Courses", gradient: "stat-card-blue", icon: "📚", roles: ["Admin", "Trainer", "Student"] },
        { key: "totalLessons", label: "Lessons", gradient: "stat-card-green", icon: "📖", roles: ["Admin", "Trainer", "Student"] },
        { key: "totalMaterials", label: "Materials", gradient: "stat-card-coral", icon: "📎", roles: ["Admin", "Trainer", "Student"] },
        { key: "totalExams", label: "Exams", gradient: "stat-card-yellow", icon: "✅", roles: ["Admin", "Trainer", "Student"] },
        { key: "totalEnrollments", label: "Enrollments", gradient: "stat-card-blue", icon: "📋", roles: ["Admin", "Trainer"] },
        { key: "totalResults", label: "Exam Submissions", gradient: "stat-card-green", icon: "📊", roles: ["Admin", "Trainer"] },
    ];

    const visibleStats = statCards.filter(c => c.roles.includes(role));
    const visibleModules = MODULES.filter(m => m.roles.includes(role));

    return (
        <div className="page">

            {/* ---- Welcome Banner ---- */}
            <div className="welcome-banner">
                <div>
                    <h2>{greeting}, {name || "User"} 👋</h2>
                    <p>{today}</p>
                </div>
                <span className="badge badge-success" style={{ fontSize: 13, padding: "6px 14px" }}>{role}</span>
            </div>

            {/* ---- Stat Cards ---- */}
            {loading ? (
                <div className="stat-grid">
                    {visibleStats.map((_, i) => (
                        <div key={i} className="stat-card" style={{ opacity: .5, animationDelay: `${i * 50}ms` }}>
                            <div className="num" style={{ background: "var(--surface-sunken)", width: 48, height: 24, borderRadius: 6 }}>&nbsp;</div>
                            <div className="label" style={{ background: "var(--surface-sunken)", width: 80, height: 12, borderRadius: 4, marginTop: 8 }}>&nbsp;</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="stat-grid">
                    {visibleStats.map((card, i) => (
                        <div
                            key={card.key}
                            className={`stat-card ${card.gradient}`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="stat-top">
                                <div className="stat-value">
                                    <div className="num" style={{ color: "#fff" }}>
                                        <AnimatedNumber value={stats?.[card.key]} />
                                    </div>
                                </div>
                                <div className="stat-icon">{card.icon}</div>
                            </div>
                            <div className="label" style={{ color: "rgba(255,255,255,.9)" }}>{card.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---- Quick Access ---- */}
            <div style={{ marginTop: 8 }}>
                <h3 style={{ marginBottom: 14, fontSize: 19, fontWeight: 700 }}>Quick Access</h3>
                <div className="module-grid">
                    {visibleModules.map((m, i) => (
                        <button
                            key={m.path}
                            className="module-card"
                            style={{ animationDelay: `${i * 40}ms` }}
                            onClick={() => navigate(m.path)}
                        >
                            <span style={{ fontSize: 22 }}>{m.icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{m.label}</div>
                                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>{m.desc}</div>
                            </div>
                            <span className="arrow">→</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;
