import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from "../services/materialService";

import { getLessons } from "../services/lessonService";

function Material() {

    const navigate = useNavigate();

    const [materials, setMaterials] = useState([]);
    const [lessons, setLessons] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        lessonID: ""
    });

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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const [file, setFile] = useState(null);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("lessonID", form.lessonID);

            if (file) {
                formData.append("file", file);
            }

            if (editingId == null) {
                await createMaterial(formData);
                alert("Material created.");
            } else {
                await updateMaterial(editingId, formData);
                alert("Material updated.");
            }

            loadMaterials();

        } catch (err) {
            console.log(err.response?.data);
            alert(JSON.stringify(err.response?.data));
        }
    };

    const handleEdit = (material) => {

        setEditingId(material.materialID);

        setForm({
            title: material.title,
            lessonID: material.lessonID
        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this material?"))
            return;

        await deleteMaterial(id);

        loadMaterials();

    };

    return (

        <div style={{ padding: "30px" }}>

            <button onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <h2>Material Management</h2>

            <hr />

            <input
                name="title"
                placeholder="Material Title"
                value={form.title}
                onChange={handleChange}
            />

            <br /><br />

            <input
                type="file"

                onChange={(e)=>

                    setFile(e.target.files[0])

                }
            />

            <br /><br />

            <select
                name="lessonID"
                value={form.lessonID}
                onChange={handleChange}
            >

                <option value="">
                    Select Lesson
                </option>

                {

                    lessons.map(lesson => (

                        <option
                            key={lesson.lessonID}
                            value={lesson.lessonID}
                        >
                            {lesson.title}
                        </option>

                    ))

                }

            </select>

            <br /><br />

            <button onClick={handleSubmit}>

                {

                    editingId == null

                        ? "Add Material"

                        : "Update Material"

                }

            </button>

            <hr />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Title</th>
                        <th>File Path</th>
                        <th>Lesson</th>
                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        materials.map(material => (

                            <tr key={material.materialID}>

                                <td>{material.materialID}</td>
                                <td>{material.title}</td>
                                <td>

                                <a

                                href={`http://localhost:5149${material.filePath}`}

                                target="_blank"

                                rel="noreferrer"

                                >

                                Open File

                                </a>

                                </td>
                                <td>{material.lessonTitle}</td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(material)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(material.materialID)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default Material;