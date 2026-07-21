import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊", roles: ["Admin", "Trainer", "Student"] },
    { label: "Roles", path: "/roles", icon: "🔑", roles: ["Admin"] },
    { label: "Users", path: "/users", icon: "👥", roles: ["Admin"] },
    { label: "Courses", path: "/courses", icon: "📚", roles: ["Admin", "Trainer", "Student"] },
    { label: "Lessons", path: "/lessons", icon: "📝", roles: ["Admin", "Trainer", "Student"] },
    { label: "Materials", path: "/materials", icon: "📁", roles: ["Admin", "Trainer", "Student"] },
    { label: "Enrollments", path: "/enrollment", icon: "📋", roles: ["Admin", "Trainer"] },
    { label: "Exams", path: "/exams", icon: "✅", roles: ["Admin", "Trainer", "Student"] },
    { label: "Questions", path: "/questions", icon: "❓", roles: ["Admin", "Trainer"] },
    { label: "Exam Results", path: "/exam-results", icon: "📈", roles: ["Admin", "Trainer"] },
    { label: "Statistics", path: "/statistics", icon: "📉", roles: ["Admin", "Trainer"] },
];

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const [collapsed, setCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const email = localStorage.getItem("email");

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const visibleItems = navItems.filter(item => item.roles.includes(role));

    const initials = name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    const currentPage = visibleItems.find(item => location.pathname === item.path);

    return (
        <div className={`layout ${collapsed ? "layout-collapsed" : ""}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="var(--brand)" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="var(--brand-light)" />
                        </svg>
                        {!collapsed && <span className="sidebar-brand-text">TrainingHub</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? "☰" : "✕"}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {visibleItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                            }
                            end={item.path === "/dashboard"}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{initials}</div>
                        {!collapsed && (
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{name}</div>
                                <div className="sidebar-user-role">{role}</div>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn btn-sm sidebar-logout"
                        onClick={logout}
                        title="Logout"
                    >
                        {collapsed ? "⏻" : "Logout"}
                    </button>
                </div>
            </aside>

            <div className="layout-main-wrapper">
                <header className="topnav">
                    <div className="topnav-left">
                        <div className="topnav-breadcrumb">
                            <a href="/dashboard">Home</a>
                            <span className="separator">/</span>
                            <span className="current">{currentPage?.label || "Dashboard"}</span>
                        </div>
                    </div>
                    <div className="topnav-right">
                        <div className="user-menu-wrapper" ref={userMenuRef}>
                            <button
                                className="topnav-avatar"
                                title={name}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                {initials}
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <div className="user-dropdown-avatar">{initials}</div>
                                        <div className="user-dropdown-info">
                                            <div className="user-dropdown-name">{name}</div>
                                            <div className="user-dropdown-email">{email || "No email"}</div>
                                        </div>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <div className="user-dropdown-details">
                                        <div className="user-dropdown-detail-row">
                                            <span className="user-dropdown-label">Role</span>
                                            <span className="user-dropdown-value">{role}</span>
                                        </div>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <button
                                        className="user-dropdown-logout"
                                        onClick={logout}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="layout-main">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
