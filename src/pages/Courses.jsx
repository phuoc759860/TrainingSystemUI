import { useEffect, useState } from "react";
import { getUsers } from "../services/UserService";
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} from "../services/CourseService";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import SidePanel from "../components/SidePanel";

const blankForm = () => ({
    title: "",
    description: "",
    trainerID: ""
});

function Course() {

    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [courses, setCourses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [confirmState, setConfirmState] = useState(null);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState(blankForm());

    useEffect(() => {
        loadCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        if (role === "Admin") {
            loadTrainers();
        }
    }, []);

    const loadTrainers = async () => {
        const res = await getUsers();
        setTrainers(res.data.filter(u => u.roleName === "Trainer"));
    };

    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await getCourses(search);
            setCourses(res.data);
        }
        catch {
            setToast({ message: "Couldn't load courses. Try refreshing.", type: "error" });
        }
        finally {
            setLoading(false);
        }
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

    const openEditPanel = (course) => {
        setEditingId(course.courseID);
        setForm({
            title: course.title,
            description: course.description,
            trainerID: course.trainerID
        });
        setPanelOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setToast({ message: "Course title is required.", type: "error" });
            return;
        }
        if (role === "Admin" && !form.trainerID) {
            setToast({ message: "Please select a trainer.", type: "error" });
            return;
        }

        const data = { ...form };
        if (role === "Trainer") {
            delete data.trainerID;
        }

        setSaving(true);

        try {
            if (editingId == null) {
                await createCourse(data);
                setToast({ message: "Course created.", type: "success" });
            } else {
                await updateCourse(editingId, data);
                setToast({ message: "Course updated.", type: "success" });
            }

            closePanel();
            loadCourses();
        }
        catch (err) {
            console.log(err);
            setToast({ message: "Operation failed.", type: "error" });
        }
        finally {
            setSaving(false);
        }
    };

    const handleDelete = (course) => {
        setConfirmState({
            title: `Delete "${course.title}"?`,
            message: "This removes the course along with its lessons, exams, and enrollments. This can't be undone.",
            confirmLabel: "Delete course",
            danger: true,
            onConfirm: async () => {
                try {
                    await deleteCourse(course.courseID);
                    setToast({ message: "Course deleted.", type: "success" });
                    loadCourses();
                }
                catch {
                    setToast({ message: "Couldn't delete that course.", type: "error" });
                }
            }
        });
    };

    return (
        <div className="page">

            <div className="welcome-banner">
                <h2>Course Management</h2>
                <p>Organize and manage your training courses</p>
            </div>

            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 0 }}>Courses</h2>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {canManage && (
                        <button className="btn btn-primary" onClick={openCreatePanel}>
                            + New Course
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-row">
                    <span className="spinner" /> Loading courses...
                </div>
            ) : courses.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📚</div>
                    <p>
                        {search
                            ? "No courses match your search."
                            : "No courses yet. Create one to get started."}
                    </p>
                </div>
            ) : (
                <table className="table-modern fade-in">

                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Trainer</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            courses.map(course => (
                                <tr key={course.courseID}>
                                    <td style={{ fontWeight: 500 }}>{course.title}</td>
                                    <td>{course.description}</td>
                                    <td><span className="pill pill-mc">{course.trainerName}</span></td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        {canManage && (
                                            <>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEditPanel(course)}>
                                                    Edit
                                                </button>{" "}
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course)}>
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
                title={editingId == null ? "Add Course" : "Edit Course"}
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
                                ? (saving ? "Adding..." : "Add Course")
                                : (saving ? "Saving..." : "Save Changes")}
                        </button>
                    </>
                }
            >
                <div className="field" style={{ marginBottom: 16 }}>
                    <label>Course Title</label>
                    <input
                        name="title"
                        placeholder="Course Title"
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

                {role === "Admin" && (
                    <div className="field">
                        <label>Trainer</label>
                        <select
                            name="trainerID"
                            value={form.trainerID}
                            onChange={handleChange}
                        >
                            <option value="">Select Trainer</option>
                            {trainers.map(trainer => (
                                <option key={trainer.userID} value={trainer.userID}>
                                    {trainer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </SidePanel>

            <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
            <Toast toast={toast} onDone={() => setToast(null)} />

        </div>
    );
}

export default Course;