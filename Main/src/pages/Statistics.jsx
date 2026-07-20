import { useEffect, useMemo, useState, useRef } from "react";
import {
    getAvailableCourses,
    getClassOverview,
    getStudentDetail,
    getExamRanking
} from "../services/StatisticsService";
import SidePanel from "../components/SidePanel";
import Toast from "../components/Toast";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList, PieChart, Pie
} from "recharts";

const SUCCESS = "#17a668";
const BRAND = "#6c5ce7";
const BRAND_LIGHT = "#8b7ffb";
const DANGER = "#e34a4a";
const INK_SOFT = "#6b7089";

function scoreColor(value) {
    if (value >= 70) return SUCCESS;
    if (value >= 50) return BRAND;
    return DANGER;
}

function truncate(str, max = 22) {
    if (!str) return "";
    return str.length > max ? `${str.slice(0, max)}…` : str;
}

function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function sortRows(rows, key, dir) {
    if (!key) return rows;
    const sorted = [...rows].sort((a, b) => {
        const av = a[key], bv = b[key];
        if (typeof av === "string") return av.localeCompare(bv);
        return (av ?? 0) - (bv ?? 0);
    });
    return dir === "desc" ? sorted.reverse() : sorted;
}

function SortableTh({ label, sortKey, currentSort, onSort }) {
    const active = currentSort.key === sortKey;
    return (
        <th
            className={`sortable ${active ? "sorted" : ""}`}
            onClick={() => onSort(sortKey)}
        >
            {label}
            <span className="sort-arrow">
                {active ? (currentSort.dir === "asc" ? "▲" : "▼") : "↕"}
            </span>
        </th>
    );
}

function MiniBar({ value, max = 100, delay = 0 }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(Math.max(0, Math.min(100, (value / max) * 100))), delay);
        return () => clearTimeout(timer);
    }, [value, max, delay]);

    return (
        <span className="mini-bar">
            <span
                className="mini-bar-fill"
                style={{ width: `${width}%`, background: scoreColor(value) }}
            />
        </span>
    );
}

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
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    if (value == null) return <>–</>;
    return <>{display}</>;
}

function ChartCard({ title, subtitle, children, height = 300, delay = 0 }) {
    return (
        <div
            className="card chart-card fade-in"
            style={{
                marginBottom: 24,
                animationDelay: `${delay}ms`,
                animationFillMode: "both"
            }}
        >
            <h3 style={{ marginTop: 0, marginBottom: subtitle ? 4 : 16, fontSize: 17 }}>{title}</h3>
            {subtitle && (
                <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 0, marginBottom: 16 }}>
                    {subtitle}
                </p>
            )}
            <div style={{ width: "100%", height }}>
                {children}
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label, unit = "%" }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 13px",
            boxShadow: "var(--shadow)",
            fontSize: 13,
            maxWidth: 260
        }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || p.payload?.fill || "var(--ink)" }}>
                    {p.name}: {p.value}{unit}
                </div>
            ))}
        </div>
    );
}

function EmptyPrompt({ icon, text }) {
    return (
        <div className="card empty-state">
            <div className="empty-icon">{icon}</div>
            <p>{text}</p>
        </div>
    );
}

function CourseSelect({ courses, value, onChange, placeholder = "Select a course..." }) {
    return (
        <div className="field" style={{ maxWidth: 320, marginBottom: 24 }}>
            <label>Course</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">{placeholder}</option>
                {courses.map(c => (
                    <option key={c.courseID} value={c.courseID}>{c.title}</option>
                ))}
            </select>
        </div>
    );
}

function KpiRow({ items }) {
    return (
        <div className="stat-grid">
            {items.map((item, i) => (
                <div className="stat-card" key={i}>
                    <div className="num" style={item.color ? { color: item.color } : undefined}>
                        {typeof item.value === "number" ? <AnimatedNumber value={item.value} /> : item.value}
                    </div>
                    <div className="label">{item.label}</div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ examsTaken, needsAttention }) {
    if (examsTaken === 0) return <span className="badge">No attempts</span>;
    if (needsAttention) return <span className={`badge badge-danger ${needsAttention ? "badge-pulse" : ""}`}>Needs Attention</span>;
    return <span className="badge badge-success">On Track</span>;
}

const TABS = [
    { key: "class", label: "Class" },
    { key: "students", label: "Students" },
    { key: "exams", label: "Exam Ranking" }
];

function Statistics() {

    const [activeTab, setActiveTab] = useState("class");
    const [courses, setCourses] = useState([]);
    const [toast, setToast] = useState(null);

    // ---------- shared: student detail panel ----------
    const [panelOpen, setPanelOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const openStudent = async (userId) => {
        setPanelOpen(true);
        setDetailLoading(true);
        setDetail(null);
        try {
            const res = await getStudentDetail(userId);
            setDetail(res.data);
        }
        catch {
            setToast({ message: "Couldn't load student details.", type: "error" });
            setPanelOpen(false);
        }
        finally {
            setDetailLoading(false);
        }
    };

    const closePanel = () => {
        setPanelOpen(false);
        setDetail(null);
    };

    // ---------- CLASS tab ----------
    const [classCourseId, setClassCourseId] = useState("");
    const [classStudents, setClassStudents] = useState([]);
    const [classLoading, setClassLoading] = useState(false);
    const [classSort, setClassSort] = useState({ key: "averageScore", dir: "asc" });
    const [classAttentionOnly, setClassAttentionOnly] = useState(false);

    // ---------- STUDENTS tab ----------
    const [studentSearch, setStudentSearch] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentSort, setStudentSort] = useState({ key: "averageScore", dir: "asc" });
    const [studentAttentionOnly, setStudentAttentionOnly] = useState(false);

    // ---------- EXAMS tab ----------
    const [examCourseId, setExamCourseId] = useState("");
    const [examRanking, setExamRanking] = useState([]);
    const [examLoading, setExamLoading] = useState(false);

    useEffect(() => {
        loadCourses();
        loadAllStudents();
    }, []);

    useEffect(() => {
        if (classCourseId) loadClassOverview();
        else setClassStudents([]);
    }, [classCourseId]);

    useEffect(() => {
        if (examCourseId) loadExamRanking();
        else setExamRanking([]);
    }, [examCourseId]);

    const loadCourses = async () => {
        try {
            const res = await getAvailableCourses();
            setCourses(res.data);
        }
        catch {
            setToast({ message: "Couldn't load courses.", type: "error" });
        }
    };

    const loadAllStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await getClassOverview();
            setAllStudents(res.data);
        }
        catch {
            setToast({ message: "Couldn't load students.", type: "error" });
        }
        finally {
            setStudentsLoading(false);
        }
    };

    const loadClassOverview = async () => {
        setClassLoading(true);
        try {
            const res = await getClassOverview(classCourseId);
            setClassStudents(res.data);
        }
        catch {
            setToast({ message: "Couldn't load class statistics.", type: "error" });
        }
        finally {
            setClassLoading(false);
        }
    };

    const loadExamRanking = async () => {
        setExamLoading(true);
        try {
            const res = await getExamRanking(examCourseId);
            setExamRanking(res.data);
        }
        catch {
            setToast({ message: "Couldn't load exam ranking.", type: "error" });
        }
        finally {
            setExamLoading(false);
        }
    };

    const toggleSort = (setSort) => (key) => {
        setSort(prev => prev.key === key
            ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
            : { key, dir: "asc" });
    };

    // ---------- CLASS derived ----------
    const classFiltered = useMemo(() => {
        let rows = classAttentionOnly ? classStudents.filter(s => s.needsAttention) : classStudents;
        return sortRows(rows, classSort.key, classSort.dir);
    }, [classStudents, classSort, classAttentionOnly]);

    const classChartData = [...classStudents]
        .filter(s => s.examsTaken > 0)
        .sort((a, b) => a.averageScore - b.averageScore)
        .map(s => ({ name: truncate(s.name, 14), fullName: s.name, score: s.averageScore }));

    const classKpis = useMemo(() => {
        const active = classStudents.filter(s => s.examsTaken > 0);
        const avg = active.length
            ? Math.round((active.reduce((sum, s) => sum + s.averageScore, 0) / active.length) * 10) / 10
            : null;
        const attention = classStudents.filter(s => s.needsAttention).length;
        return [
            { label: "Enrolled Students", value: classStudents.length },
            { label: "Class Average", value: avg != null ? `${avg}%` : "—", color: avg != null ? scoreColor(avg) : undefined },
            { label: "Needs Attention", value: attention, color: attention > 0 ? DANGER : SUCCESS }
        ];
    }, [classStudents]);

    const passFailData = useMemo(() => {
        const active = classStudents.filter(s => s.examsTaken > 0);
        const passing = active.filter(s => !s.needsAttention).length;
        const attention = active.length - passing;
        if (active.length === 0) return [];
        return [
            { name: "On Track", value: passing, fill: SUCCESS },
            { name: "Needs Attention", value: attention, fill: DANGER }
        ];
    }, [classStudents]);

    // ---------- STUDENTS derived ----------
    const filteredStudents = useMemo(() => {
        let rows = studentSearch.trim()
            ? allStudents.filter(s => s.name.toLowerCase().includes(studentSearch.trim().toLowerCase()))
            : allStudents;
        if (studentAttentionOnly) rows = rows.filter(s => s.needsAttention);
        return sortRows(rows, studentSort.key, studentSort.dir);
    }, [allStudents, studentSearch, studentSort, studentAttentionOnly]);

    const studentKpis = useMemo(() => {
        const active = allStudents.filter(s => s.examsTaken > 0);
        const avg = active.length
            ? Math.round((active.reduce((sum, s) => sum + s.averageScore, 0) / active.length) * 10) / 10
            : null;
        const attention = allStudents.filter(s => s.needsAttention).length;
        return [
            { label: "Total Students", value: allStudents.length },
            { label: "Overall Average", value: avg != null ? `${avg}%` : "—", color: avg != null ? scoreColor(avg) : undefined },
            { label: "Needs Attention", value: attention, color: attention > 0 ? DANGER : SUCCESS }
        ];
    }, [allStudents]);

    // ---------- EXAMS derived ----------
    const examChartData = examRanking.map((e, i) => ({
        name: truncate(e.examTitle, 26),
        fullName: e.examTitle,
        rank: i + 1,
        score: e.averageScore
    }));

    const examKpis = useMemo(() => {
        if (examRanking.length === 0) return [];
        const top = examRanking[0];
        const bottom = examRanking[examRanking.length - 1];
        return [
            { label: "Exams Ranked", value: examRanking.length },
            { label: "Top Score", value: `${top.averageScore}%`, color: SUCCESS },
            { label: "Lowest Score", value: `${bottom.averageScore}%`, color: bottom.averageScore < 50 ? DANGER : undefined }
        ];
    }, [examRanking]);

    const courseBreakdownData = detail?.courseBreakdown.map(c => ({
        name: truncate(c.courseTitle, 16),
        fullName: c.courseTitle,
        score: c.averageScore
    })) ?? [];

    const skillTypeData = detail
        ? [
              detail.multipleChoiceAccuracy != null && { name: "Multiple Choice", score: detail.multipleChoiceAccuracy },
              detail.essayAverageScore != null && { name: "Essay", score: detail.essayAverageScore }
          ].filter(Boolean)
        : [];

    const rankMedal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

    return (
        <div className="page">

            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 12 }}>Performance Statistics</h2>
                    <p style={{ color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        See how your class is doing and where to focus next.
                    </p>
                </div>
            </div>

            {/* ---- Segmented tab bar ---- */}
            <div className="tabs-segment">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={activeTab === t.key ? "active" : ""}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ================= CLASS TAB ================= */}
            {activeTab === "class" && (
                <div className="tab-content" key="class">
                    <CourseSelect
                        courses={courses}
                        value={classCourseId}
                        onChange={setClassCourseId}
                        placeholder="Select a course to see its class statistics..."
                    />

                    {!classCourseId ? (
                        <EmptyPrompt icon="🏫" text="Select a course above to view its class statistics." />
                    ) : classLoading ? (
                        <div className="loading-row">
                            <span className="spinner" /> Loading class statistics...
                        </div>
                    ) : classStudents.length === 0 ? (
                        <EmptyPrompt icon="📈" text="No enrolled students in this course yet." />
                    ) : (
                        <>
                            <KpiRow items={classKpis} />

                            {(classChartData.length > 0 || passFailData.length > 0) && (
                                <div style={{ display: "grid", gridTemplateColumns: passFailData.length ? "2fr 1fr" : "1fr", gap: 24 }}>
                                    {classChartData.length > 0 && (
                                        <ChartCard
                                            title="Class Score Distribution"
                                            subtitle="Average score per student, lowest to highest"
                                            height={Math.max(220, classChartData.length * 34)}
                                            delay={50}
                                        >
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={classChartData} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                                    <Tooltip content={<CustomTooltip />} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
                                                    <Bar dataKey="score" name="Average Score" radius={[0, 6, 6, 0]}
                                                        animationBegin={100}
                                                        animationDuration={800}
                                                        animationEasing="ease-out"
                                                    >
                                                        {classChartData.map((entry, i) => (
                                                            <Cell key={i} fill={scoreColor(entry.score)} />
                                                        ))}
                                                        <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "var(--ink)" }} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    )}

                                    {passFailData.length > 0 && (
                                        <ChartCard title="On Track vs Needs Attention" height={Math.max(220, classChartData.length * 34)} delay={150}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Tooltip content={<CustomTooltip unit=" students" />} />
                                                    <Pie
                                                        data={passFailData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius="60%"
                                                        outerRadius="85%"
                                                        paddingAngle={3}
                                                        animationBegin={200}
                                                        animationDuration={1000}
                                                        animationEasing="ease-out"
                                                    >
                                                        {passFailData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: -8, fontSize: 12.5, color: "var(--ink-soft)" }}>
                                                <span><span style={{ color: SUCCESS }}>●</span> On Track</span>
                                                <span><span style={{ color: DANGER }}>●</span> Needs Attention</span>
                                            </div>
                                        </ChartCard>
                                    )}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                                <button
                                    className={`chip-toggle ${classAttentionOnly ? "active" : ""}`}
                                    onClick={() => setClassAttentionOnly(v => !v)}
                                >
                                    ⚠ Needs Attention only
                                </button>
                            </div>

                            <table className="table-modern fade-in">
                                <thead>
                                    <tr>
                                        <SortableTh label="Student" sortKey="name" currentSort={classSort} onSort={toggleSort(setClassSort)} />
                                        <SortableTh label="Exams Taken" sortKey="examsTaken" currentSort={classSort} onSort={toggleSort(setClassSort)} />
                                        <SortableTh label="Average Score" sortKey="averageScore" currentSort={classSort} onSort={toggleSort(setClassSort)} />
                                        <SortableTh label="Pass Rate" sortKey="passRate" currentSort={classSort} onSort={toggleSort(setClassSort)} />
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classFiltered.map((s, i) => (
                                        <tr
                                            key={s.userID}
                                            className={s.examsTaken > 0 ? "clickable-row" : ""}
                                            onClick={() => s.examsTaken > 0 && openStudent(s.userID)}
                                            style={{ animationDelay: `${i * 20}ms` }}
                                        >
                                            <td className="name-cell">
                                                <span className="avatar-chip">{initials(s.name)}</span>
                                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                            </td>
                                            <td>{s.examsTaken}</td>
                                            <td>
                                                {s.examsTaken > 0 ? (
                                                    <>
                                                        <MiniBar value={s.averageScore} delay={300 + i * 20} />
                                                        {s.averageScore}%
                                                    </>
                                                ) : "—"}
                                            </td>
                                            <td>{s.examsTaken > 0 ? `${s.passRate}%` : "—"}</td>
                                            <td>
                                                <StatusBadge examsTaken={s.examsTaken} needsAttention={s.needsAttention} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* ================= STUDENTS TAB ================= */}
            {activeTab === "students" && (
                <div className="tab-content" key="students">
                    <KpiRow items={studentKpis} />

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
                        <div className="field" style={{ maxWidth: 320, marginBottom: 0 }}>
                            <label>Search Student</label>
                            <input
                                placeholder="Search by name, or leave blank for all..."
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className={`chip-toggle ${studentAttentionOnly ? "active" : ""}`}
                            onClick={() => setStudentAttentionOnly(v => !v)}
                        >
                            ⚠ Needs Attention only
                        </button>
                    </div>

                    {studentsLoading ? (
                        <div className="loading-row">
                            <span className="spinner" /> Loading students...
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <EmptyPrompt
                            icon="🔍"
                            text={studentSearch ? "No students match that name." : "No enrolled students found."}
                        />
                    ) : (
                        <table className="table-modern fade-in">
                            <thead>
                                <tr>
                                    <SortableTh label="Student" sortKey="name" currentSort={studentSort} onSort={toggleSort(setStudentSort)} />
                                    <SortableTh label="Exams Taken" sortKey="examsTaken" currentSort={studentSort} onSort={toggleSort(setStudentSort)} />
                                    <SortableTh label="Average Score" sortKey="averageScore" currentSort={studentSort} onSort={toggleSort(setStudentSort)} />
                                    <SortableTh label="Pass Rate" sortKey="passRate" currentSort={studentSort} onSort={toggleSort(setStudentSort)} />
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s, i) => (
                                    <tr
                                        key={s.userID}
                                        className={s.examsTaken > 0 ? "clickable-row" : ""}
                                        onClick={() => s.examsTaken > 0 && openStudent(s.userID)}
                                        style={{ animationDelay: `${i * 20}ms` }}
                                    >
                                        <td className="name-cell">
                                            <span className="avatar-chip">{initials(s.name)}</span>
                                            <span style={{ fontWeight: 600 }}>{s.name}</span>
                                        </td>
                                        <td>{s.examsTaken}</td>
                                        <td>
                                            {s.examsTaken > 0 ? (
                                                <>
                                                    <MiniBar value={s.averageScore} delay={300 + i * 20} />
                                                    {s.averageScore}%
                                                </>
                                            ) : "—"}
                                        </td>
                                        <td>{s.examsTaken > 0 ? `${s.passRate}%` : "—"}</td>
                                        <td>
                                            <StatusBadge examsTaken={s.examsTaken} needsAttention={s.needsAttention} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ================= EXAM RANKING TAB ================= */}
            {activeTab === "exams" && (
                <div className="tab-content" key="exams">
                    <CourseSelect
                        courses={courses}
                        value={examCourseId}
                        onChange={setExamCourseId}
                        placeholder="Select a course to rank its exams..."
                    />

                    {!examCourseId ? (
                        <EmptyPrompt icon="🏆" text="Select a course above to see its exams ranked by performance." />
                    ) : examLoading ? (
                        <div className="loading-row">
                            <span className="spinner" /> Loading exam ranking...
                        </div>
                    ) : examRanking.length === 0 ? (
                        <EmptyPrompt icon="🗒️" text="No graded attempts for this course's exams yet." />
                    ) : (
                        <>
                            <KpiRow items={examKpis} />

                            <ChartCard
                                title="Exam Ranking"
                                subtitle="Average score per exam, highest to lowest"
                                height={Math.max(220, examChartData.length * 38)}
                                delay={50}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={examChartData} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                        <Tooltip content={<CustomTooltip />} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
                                        <Bar dataKey="score" name="Average Score" radius={[0, 6, 6, 0]}
                                            animationBegin={100}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        >
                                            {examChartData.map((entry, i) => (
                                                <Cell key={i} fill={scoreColor(entry.score)} />
                                            ))}
                                            <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "var(--ink)" }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <table className="table-modern fade-in">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Exam</th>
                                        <th>Attempts</th>
                                        <th>Average Score</th>
                                        <th>Pass Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examRanking.map((e, i) => (
                                        <tr key={e.examID} style={{ animationDelay: `${i * 20}ms` }}>
                                            <td style={{ fontWeight: 700 }}>{rankMedal(i + 1)}</td>
                                            <td style={{ fontWeight: 600 }}>{e.examTitle}</td>
                                            <td>{e.attemptCount}</td>
                                            <td>
                                                <MiniBar value={e.averageScore} delay={300 + i * 20} />
                                                <span className={`badge ${e.averageScore < 50 ? "badge-danger" : "badge-success"}`}>
                                                    {e.averageScore}%
                                                </span>
                                            </td>
                                            <td>{e.passRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* ---- Shared student detail panel ---- */}
            <SidePanel
                open={panelOpen}
                title={detail ? detail.name : "Student Details"}
                subtitle={detail ? `${detail.examsTaken} exam(s) taken across all enrolled courses` : undefined}
                onClose={closePanel}
                footer={<button className="btn btn-outline" onClick={closePanel}>Close</button>}
            >
                {detailLoading ? (
                    <div className="loading-row">
                        <span className="spinner" /> Loading...
                    </div>
                ) : detail && (
                    <>
                        <div className="stat-grid" style={{ marginBottom: 22 }}>
                            <div className="stat-card">
                                <div className="num">{detail.averageScore}%</div>
                                <div className="label">Average Score</div>
                            </div>
                            <div className="stat-card">
                                <div className="num">{detail.passRate}%</div>
                                <div className="label">Pass Rate</div>
                            </div>
                        </div>

                        {(detail.strongestCourse || detail.weakestCourse) && (
                            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
                                {detail.strongestCourse && (
                                    <span className="badge badge-success">💪 Strongest: {detail.strongestCourse}</span>
                                )}
                                {detail.weakestCourse && detail.weakestCourse !== detail.strongestCourse && (
                                    <span className="badge badge-danger">⚠️ Weakest: {detail.weakestCourse}</span>
                                )}
                            </div>
                        )}

                        {courseBreakdownData.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h4 style={{ marginBottom: 10 }}>Score by Enrolled Course</h4>
                                <div style={{ width: "100%", height: Math.max(140, courseBreakdownData.length * 42) }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={courseBreakdownData} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                            <Tooltip content={<CustomTooltip />} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
                                            <Bar dataKey="score" name="Average Score" radius={[0, 6, 6, 0]}
                                                animationBegin={100}
                                                animationDuration={600}
                                            >
                                                {courseBreakdownData.map((entry, i) => (
                                                    <Cell key={i} fill={scoreColor(entry.score)} />
                                                ))}
                                                <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: "var(--ink)" }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {skillTypeData.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h4 style={{ marginBottom: 10 }}>By Question Type</h4>
                                <div style={{ width: "100%", height: 120 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={skillTypeData} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="score" name="Score" radius={[0, 6, 6, 0]}
                                                animationBegin={100}
                                                animationDuration={600}
                                            >
                                                {skillTypeData.map((entry, i) => (
                                                    <Cell key={i} fill={scoreColor(entry.score)} />
                                                ))}
                                                <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: "var(--ink)" }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {detail.weakestExams.length > 0 && (
                            <>
                                <h4 style={{ margin: "22px 0 10px" }}>Lowest-Scoring Exams</h4>
                                {detail.weakestExams.map(e => (
                                    <div key={e.examID} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                        <span>{e.examTitle}</span>
                                        <span className="badge badge-danger">{e.score}%</span>
                                    </div>
                                ))}
                            </>
                        )}

                        {detail.strongestExams.length > 0 && (
                            <>
                                <h4 style={{ margin: "22px 0 10px" }}>Highest-Scoring Exams</h4>
                                {detail.strongestExams.map(e => (
                                    <div key={e.examID} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                        <span>{e.examTitle}</span>
                                        <span className="badge badge-success">{e.score}%</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </SidePanel>

            <Toast toast={toast} onDone={() => setToast(null)} />

        </div>
    );
}

export default Statistics;
