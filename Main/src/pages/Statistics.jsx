import { useEffect, useState } from "react";
import {
    getAvailableCourses,
    getClassOverview,
    getStudentDetail,
    getExamRanking
} from "../services/StatisticsService";
import BackButton from "../components/BackButton";
import SidePanel from "../components/SidePanel";
import Toast from "../components/Toast";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from "recharts";

const SUCCESS = "#16a34a";
const BRAND = "#7c3aed";
const DANGER = "#dc2626";
const INK_SOFT = "#6b6478";

function scoreColor(value) {
    if (value >= 70) return SUCCESS;
    if (value >= 50) return BRAND;
    return DANGER;
}

function truncate(str, max = 22) {
    if (!str) return "";
    return str.length > max ? `${str.slice(0, max)}…` : str;
}

function ChartCard({ title, subtitle, children, height = 300 }) {
    return (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: subtitle ? 4 : 16 }}>{title}</h3>
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
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "var(--shadow)",
            fontSize: 13,
            maxWidth: 260
        }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || "var(--ink)" }}>
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

    // ---------- STUDENTS tab ----------
    const [studentSearch, setStudentSearch] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(true);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classCourseId]);

    useEffect(() => {
        if (examCourseId) loadExamRanking();
        else setExamRanking([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const res = await getClassOverview(); // no courseId = every accessible course
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

    // ---------- chart data ----------

    const classChartData = [...classStudents]
        .filter(s => s.examsTaken > 0)
        .sort((a, b) => a.averageScore - b.averageScore)
        .map(s => ({ name: truncate(s.name, 14), fullName: s.name, score: s.averageScore }));

    const filteredStudents = studentSearch.trim()
        ? allStudents.filter(s => s.name.toLowerCase().includes(studentSearch.trim().toLowerCase()))
        : allStudents;

    const examChartData = examRanking.map((e, i) => ({
        name: truncate(e.examTitle, 26),
        fullName: e.examTitle,
        rank: i + 1,
        score: e.averageScore
    }));

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
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Performance Statistics</h2>
                    <p style={{ color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        See how your class is doing and where to focus next.
                    </p>
                </div>
            </div>

            {/* ---- Tab bar ---- */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={`btn ${activeTab === t.key ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ================= CLASS TAB ================= */}
            {activeTab === "class" && (
                <>
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
                            {classChartData.length > 0 && (
                                <ChartCard
                                    title="Class Score Distribution"
                                    subtitle="Average score per student, lowest to highest"
                                    height={Math.max(220, classChartData.length * 34)}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={classChartData} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                            <Tooltip content={<CustomTooltip />} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
                                            <Bar dataKey="score" name="Average Score" radius={[0, 4, 4, 0]}>
                                                {classChartData.map((entry, i) => (
                                                    <Cell key={i} fill={scoreColor(entry.score)} />
                                                ))}
                                                <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "var(--ink)" }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            <table className="table-modern fade-in">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Exams Taken</th>
                                        <th>Average Score</th>
                                        <th>Pass Rate</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classStudents.map(s => (
                                        <tr key={s.userID}>
                                            <td style={{ fontWeight: 500 }}>{s.name}</td>
                                            <td>{s.examsTaken}</td>
                                            <td>{s.examsTaken > 0 ? `${s.averageScore}%` : "—"}</td>
                                            <td>{s.examsTaken > 0 ? `${s.passRate}%` : "—"}</td>
                                            <td>
                                                {s.examsTaken === 0 ? (
                                                    <span className="badge">No attempts</span>
                                                ) : s.needsAttention ? (
                                                    <span className="badge badge-danger">Needs Attention</span>
                                                ) : (
                                                    <span className="badge badge-success">On Track</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => openStudent(s.userID)}
                                                    disabled={s.examsTaken === 0}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}

            {/* ================= STUDENTS TAB ================= */}
            {activeTab === "students" && (
                <>
                    <div className="field" style={{ maxWidth: 320, marginBottom: 24 }}>
                        <label>Search Student</label>
                        <input
                            placeholder="Search by name, or leave blank for all..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                        />
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
                                    <th>Student</th>
                                    <th>Exams Taken (all courses)</th>
                                    <th>Average Score</th>
                                    <th>Pass Rate</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(s => (
                                    <tr key={s.userID}>
                                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                                        <td>{s.examsTaken}</td>
                                        <td>{s.examsTaken > 0 ? `${s.averageScore}%` : "—"}</td>
                                        <td>{s.examsTaken > 0 ? `${s.passRate}%` : "—"}</td>
                                        <td>
                                            {s.examsTaken === 0 ? (
                                                <span className="badge">No attempts</span>
                                            ) : s.needsAttention ? (
                                                <span className="badge badge-danger">Needs Attention</span>
                                            ) : (
                                                <span className="badge badge-success">On Track</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => openStudent(s.userID)}
                                                disabled={s.examsTaken === 0}
                                            >
                                                View Performance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}

            {/* ================= EXAM RANKING TAB ================= */}
            {activeTab === "exams" && (
                <>
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
                            <ChartCard
                                title="Exam Ranking"
                                subtitle="Average score per exam, highest to lowest"
                                height={Math.max(220, examChartData.length * 38)}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={examChartData} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: INK_SOFT }} />
                                        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: INK_SOFT }} />
                                        <Tooltip content={<CustomTooltip />} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
                                        <Bar dataKey="score" name="Average Score" radius={[0, 4, 4, 0]}>
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
                                        <tr key={e.examID}>
                                            <td style={{ fontWeight: 600 }}>{rankMedal(i + 1)}</td>
                                            <td style={{ fontWeight: 500 }}>{e.examTitle}</td>
                                            <td>{e.attemptCount}</td>
                                            <td>
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
                </>
            )}

            {/* ---- Shared student detail panel (used by Class + Students tabs) ---- */}
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
                                            <Bar dataKey="score" name="Average Score" radius={[0, 4, 4, 0]}>
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
                                            <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
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