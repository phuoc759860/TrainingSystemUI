import { useEffect, useState } from "react";
import {
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson
} from "../services/LessonService";
import { getCourses } from "../services/CourseService";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import SidePanel from "../components/SidePanel";

const blankForm = () => ({
    title: "",
    description: "",
    courseID: ""
});

function Lesson() {

    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [courseId, setCourseId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [confirmState, setConfirmState] = useState(null);
    const [toast, setToast] = useState(null);
    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [form, setForm] = useState(blankForm());

    useEffect(() => {
        loadLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, courseId]);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadLessons = async () => {
        setLoading(true);
        try {
            const res = await getLessons(search, courseId);
            setLessons(res.data);
        }
        catch {
            setToast({ message: "Couldn't load lessons. Try refreshing.", type: "error" });
        }
        finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        const res = await getCourses();
        setCourses(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const closePanel = () => {
        setPanelOpen(false);
        setEditingId(null);
        setForm(blankForm());
    };

    const openCreatePanel = () => {
        setEditingId(null);
        setForm(blankForm());
        setPanelOpen(true);
    };

    const openEditPanel = (lesson) => {
        setEditingId(lesson.lessonID);
        setForm({
            title: lesson.title,
            description: lesson.description,
            courseID: lesson.courseID
        });
        setPanelOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.courseID) {
            setToast({ message: "Title and course are required.", type: "error" });
            return;
        }

        setSaving(true);

        try {

            if (editingId == null) {
                await createLesson(form);
                setToast({ message: "Lesson created.", type: "success" });
            }
            else {
                await updateLesson(editingId, form);
                setToast({ message: "Lesson updated.", type: "success" });
            }

            closePanel();
            loadLessons();

        }
        catch (err) {
            console.log(err);
            setToast({ message: "Operation failed.", type: "error" });
        }
        finally {
            setSaving(false);
        }
    };

    const handleDelete = (lesson) => {
        setConfirmState({
            title: `Delete "${lesson.title}"?`,
            message: "This can't be undone.",
            confirmLabel: "Delete lesson",
            danger: true,
            onConfirm: async () => {
                try {
                    await deleteLesson(lesson.lessonID);
                    setToast({ message: "Lesson deleted.", type: "success" });
                    loadLessons();
                }
                catch {
                    setToast({ message: "Couldn't delete that lesson.", type: "error" });
                }
            }
        });
    };

    return (

        <div className="page">

            <div className="welcome-banner">
                <h2>Lesson Management</h2>
                <p>Manage lessons and course content</p>
            </div>

            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 0 }}>Lessons</h2>
                </div>

                {canManage && (
                    <button className="btn btn-primary" onClick={openCreatePanel}>
                        + New Lesson
                    </button>
                )}
            </div>

            <div className="card fade-in" style={{ marginBottom: 24 }}>
                <div className="form-grid">
                    <div className="field">
                        <label>Search</label>
                        <input
                            placeholder="Search lesson..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Filter by Course</label>
                        <select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {courses.map(c => (
                                <option key={c.courseID} value={c.courseID}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-row">
                    <span className="spinner" /> Loading lessons...
                </div>
            ) : lessons.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📘</div>
                    <p>
                        {search || courseId
                            ? "No lessons match your filters."
                            : "No lessons yet. Create one to get started."}
                    </p>
                </div>
            ) : (
                <table className="table-modern fade-in">

                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Course</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            lessons.map(lesson => (
                                <tr key={lesson.lessonID}>
                                    <td style={{ fontWeight: 500 }}>{lesson.title}</td>
                                    <td>{lesson.description}</td>
                                    <td><span className="pill pill-mc">{lesson.courseTitle}</span></td>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {canManage && (
                                            <>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEditPanel(lesson)}>
                                                    Edit
                                                </button>{" "}
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lesson)}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>

                </table>
            )}

            <SidePanel
                open={panelOpen}
                title={editingId == null ? "Add Lesson" : "Edit Lesson"}
                subtitle={editingId != null ? `Editing "${form.title}"` : undefined}
                onClose={closePanel}
                footer={
                    <>
                        <button className="btn btn-outline" onClick={closePanel} disabled={saving}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                            {saving && <span className="spinner" />}
                            {editingId == null
                                ? (saving ? "Adding..." : "Add Lesson")
                                : (saving ? "Saving..." : "Save Changes")}
                        </button>
                    </>
                }
            >
                <div className="field" style={{ marginBottom: 16 }}>
                    <label>Lesson Title</label>
                    <input
                        name="title"
                        placeholder="Lesson Title"
                        value={form.title}
                        onChange={handleChange}
                        autoFocus
                    />
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                    <label>Description</label>
                    <textarea
                        name="description"
                        rows="3"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="field">
                    <label>Course</label>
                    <select
                        name="courseID"
                        value={form.courseID}
                        onChange={handleChange}
                    >
                        <option value="">Select Course</option>
                        {
                            courses.map(course => (
                                <option key={course.courseID} value={course.courseID}>
                                    {course.title}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </SidePanel>

            <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
            <Toast toast={toast} onDone={() => setToast(null)} />

        </div>

    );

}

export default Lesson;