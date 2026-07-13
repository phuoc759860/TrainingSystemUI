// Main/src/pages/Material.jsx
import { useEffect, useState } from "react";
import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from "../services/MaterialService";
import { getLessons } from "../services/LessonService";
import BackButton from "../components/BackButton";

// Files are served from the API host itself (see Program.cs UseStaticFiles),
// not under /api, so this can't reuse the axios baseURL directly.
const FILE_HOST = "http://localhost:5149";

function Material() {

    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [materials, setMaterials] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [lessonFilter, setLessonFilter] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [title, setTitle] = useState("");
    const [lessonID, setLessonID] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        loadMaterials();
        loadLessons();
    }, []);

    const loadMaterials = async () => {
        const res = await getMaterials();
        setMaterials(res.data);
    };

    const loadLessons = async () => {
        const res = await getLessons();
        setLessons(res.data);
    };

    const resetForm = () => {
        setTitle("");
        setLessonID("");
        setFile(null);
        setEditingId(null);
    };

    const handleSubmit = async () => {

        if (title.trim() === "" || lessonID === "") {
            alert("Title and lesson are required.");
            return;
        }

        if (editingId == null && !file) {
            alert("Please choose a file to upload.");
            return;
        }

        const data = new FormData();
        data.append("Title", title);
        data.append("LessonID", lessonID);
        if (file) {
            data.append("File", file);
        }

        try {
            if (editingId == null) {
                await createMaterial(data);
                alert("Material uploaded.");
            } else {
                await updateMaterial(editingId, data);
                alert("Material updated.");
            }

            resetForm();
            loadMaterials();
        }
        catch (err) {
            console.log(err);
            alert("Operation failed.");
        }
    };

    const handleEdit = (material) => {
        setEditingId(material.materialID);
        setTitle(material.title);
        setLessonID(material.lessonID);
        setFile(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material?"))
            return;

        await deleteMaterial(id);
        loadMaterials();
    };

    const visibleMaterials = lessonFilter
        ? materials.filter(m => String(m.lessonID) === String(lessonFilter))
        : materials;

    return (
        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Material Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
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

            {canManage && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="form-grid">
                        <div className="field">
                            <label>Title</label>
                            <input
                                placeholder="Material Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label>Lesson</label>
                            <select
                                value={lessonID}
                                onChange={(e) => setLessonID(e.target.value)}
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
                            <label>
                                {editingId == null ? "File" : "Replace File (optional)"}
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0] ?? null)}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingId == null ? "Upload Material" : "Update Material"}
                    </button>

                    {editingId != null && (
                        <button
                            className="btn btn-outline"
                            style={{ marginLeft: 8 }}
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}

            <table className="table-modern">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Lesson</th>
                        <th>File</th>
                        {canManage && <th></th>}
                    </tr>
                </thead>
                <tbody>
                    {visibleMaterials.map(material => (
                        <tr key={material.materialID}>
                            <td>{material.materialID}</td>
                            <td>{material.title}</td>
                            <td>{material.lessonTitle}</td>
                            <td>
                                <a href={`${FILE_HOST}${material.filePath}`} target="_blank" rel="noreferrer">
                                    Open
                                </a>
                            </td>
                            {canManage && (
                                <td>
                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(material)}>
                                        Edit
                                    </button>{" "}
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(material.materialID)}>
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Material;