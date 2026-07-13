import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} from "../services/CourseService";
import BackButton from "../components/BackButton";

function Course() {

    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [search, setSearch] = useState("");

    const role = localStorage.getItem("role");

    const [form, setForm] = useState({
        title: "",
        description: "",
        trainerID: ""
    });

    useEffect(() => {
        loadCourses();
    }, [search]);

    useEffect(() => {
        if (role === "Admin") {
            loadTrainers();
        }
    }, []);

    const loadTrainers = async () => {

        const res = await getUsers();

        const trainerList = res.data.filter(
            u => u.roleName === "Trainer"
        );

        setTrainers(trainerList);

    };

    const loadCourses = async () => {
        const res = await getCourses(search);
        setCourses(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({ title: "", description: "", trainerID: "" });
        setEditingId(null);
    };

    const handleSubmit = async () => {

        const data = { ...form };

        if (role === "Trainer") {
            delete data.trainerID;
        }

        try {

            if (editingId == null) {
                await createCourse(data);
                alert("Course created.");
            } else {
                await updateCourse(editingId, data);
                alert("Course updated.");
            }

            resetForm();
            loadCourses();

        }
        catch (err) {
            console.log(err);
            alert("Operation failed.");
        }
    };

    const handleEdit = (course) => {

        setEditingId(course.courseID);

        setForm({
            title: course.title,
            description: course.description,
            trainerID: course.trainerID
        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this course?"))
            return;

        await deleteCourse(id);
        loadCourses();

    };

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Course Management</h2>
                </div>

                <input
                    type="text"
                    placeholder="Search course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: "9px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 14
                    }}
                />
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">

                    <div className="field">
                        <label>Course Title</label>
                        <input
                            name="title"
                            placeholder="Course Title"
                            value={form.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
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

                </div>

                <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingId == null ? "Add Course" : "Update Course"}
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

            <table className="table-modern">

                <thead>
                    <tr>
                        <th>ID</th>
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
                                <td>{course.courseID}</td>
                                <td>{course.title}</td>
                                <td>{course.description}</td>
                                <td>{course.trainerName}</td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(course)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(course.courseID)}
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

export default Course;