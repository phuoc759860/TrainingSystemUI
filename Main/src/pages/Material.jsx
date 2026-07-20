import { useEffect, useState } from "react";
import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from "../services/MaterialService";
import { getLessons } from "../services/LessonService";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import SidePanel from "../components/SidePanel";

// Files are served from the API host itself (see Program.cs UseStaticFiles),
// not under /api, so this can't reuse the axios baseURL directly.
const FILE_HOST = "http://localhost:5149";

const blankForm = () => ({
    title: "",
    lessonID: "",
    file: null
});

function Material() {

    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [materials, setMaterials] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [lessonFilter, setLessonFilter] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [confirmState, setConfirmState] = useState(null);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState(blankForm());

    useEffect(() => {
        loadMaterials();
        loadLessons();
    }, []);

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const res = await getMaterials();
            setMaterials(res.data);
        }
        catch {
            setToast({ message: "Couldn't load materials. Try refreshing.", type: "error" });
        }
        finally {
            setLoading(false);
        }
    };

    const loadLessons = async () => {
        const res = await getLessons();
        setLessons(res.data);
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

    const openEditPanel = (material) => {
        setEditingId(material.materialID);
        setForm({
            title: material.title,
            lessonID: material.lessonID,
            file: null
        });
        setPanelOpen(true);
    };

    const handleSubmit = async () => {

        if (!form.title.trim() || !form.lessonID) {
            setToast({ message: "Title and lesson are required.", type: "error" });
            return;
        }

        if (editingId == null && !form.file) {
            setToast({ message: "Please choose a file to upload.", type: "error" });
            return;
        }

        const data = new FormData();
        data.append("Title", form.title);
        data.append("LessonID", form.lessonID);
        if (form.file) {
            data.append("File", form.file);
        }

        setSaving(true);

        try {
            if (editingId == null) {
                await createMaterial(data);
                setToast({ message: "Material uploaded.", type: "success" });
            } else {
                await updateMaterial(editingId, data);
                setToast({ message: "Material updated.", type: "success" });
            }

            closePanel();
            loadMaterials();
        }
        catch (err) {
            console.log(err);
            setToast({ message: "Operation failed.", type: "error" });
        }
        finally {
            setSaving(false);
        }
    };

    const handleDelete = (material) => {
        setConfirmState({
            title: `Delete "${material.title}"?`,
            message: "This can't be undone.",
            confirmLabel: "Delete material",
            danger: true,
            onConfirm: async () => {
                try {
                    await deleteMaterial(material.materialID);
                    setToast({ message: "Material deleted.", type: "success" });
                    loadMaterials();
                }
                catch {
                    setToast({ message: "Couldn't delete that material.", type: "error" });
                }
            }
        });
    };

    const visibleMaterials = lessonFilter
        ? materials.filter(m => String(m.lessonID) === String(lessonFilter))
        : materials;

    return (
        <div className="page">

            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 12 }}>Material Management</h2>
                </div>

                {canManage && (
                    <button className="btn btn-primary" onClick={openCreatePanel}>
                        + New Material
                    </button>
                )}
            </div>

            <div className="card fade-in" style={{ marginBottom: 24 }}>
                <div className="form-grid">
                    <div className="field">
                        <label>Filter by Lesson</label>
                        <select
                            value={lessonFilter}
                            onChange={(e) => setLessonFilter(e.target.value)}
                        >
                            <option value="">All Lessons</option>
                            {lessons.map(l => (
                                <option key={l.lessonID} value={l.lessonID}>
                                    {l.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-row">
                    <span className="spinner" /> Loading materials...
                </div>
            ) : visibleMaterials.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📎</div>
                    <p>
                        {lessonFilter
                            ? "No materials for this lesson yet."
                            : "No materials yet. Upload one to get started."}
                    </p>
                </div>
            ) : (
                <table className="table-modern fade-in">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Lesson</th>
                            <th>File</th>
                            {canManage && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleMaterials.map(material => (
                            <tr key={material.materialID}>
                                <td style={{ fontWeight: 500 }}>{material.title}</td>
                                <td><span className="pill pill-mc">{material.lessonTitle}</span></td>
                                <td>
                                    <a href={`${FILE_HOST}${material.filePath}`} target="_blank" rel="noreferrer">
                                        Open
                                    </a>
                                </td>
                                {canManage && (
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openEditPanel(material)}>
                                            Edit
                                        </button>{" "}
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(material)}>
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <SidePanel
                open={panelOpen}
                title={editingId == null ? "Upload Material" : "Edit Material"}
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
                                ? (saving ? "Uploading..." : "Upload Material")
                                : (saving ? "Saving..." : "Save Changes")}
                        </button>
                    </>
                }
            >
                <div className="field" style={{ marginBottom: 16 }}>
                    <label>Title</label>
                    <input
                        placeholder="Material Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                    <label>Lesson</label>
                    <select
                        value={form.lessonID}
                        onChange={(e) => setForm({ ...form, lessonID: e.target.value })}
                        disabled={editingId != null}
                    >
                        <option value="">Select Lesson</option>
                        {lessons.map(l => (
                            <option key={l.lessonID} value={l.lessonID}>
                                {l.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>{editingId == null ? "File" : "Replace File (optional)"}</label>
                    <input
                        type="file"
                        onChange={(e) => setForm({ ...form, file: e.target.files[0] ?? null })}
                    />
                </div>
            </SidePanel>

            <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
            <Toast toast={toast} onDone={() => setToast(null)} />

        </div>
    );
}

export default Material;