import { useEffect, useState } from "react";
import {
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson
} from "../services/LessonService";
import { getCourses } from "../services/CourseService";
import BackButton from "../components/BackButton";

function Lesson() {

    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [courseId, setCourseId] = useState("");
    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [form, setForm] = useState({
        title: "",
        description: "",
        courseID: ""
    });

    useEffect(() => {
        loadLessons();
    }, [search, courseId]);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadLessons = async () => {
        const res = await getLessons(search, courseId);
        setLessons(res.data);
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

    const resetForm = () => {
        setForm({ title: "", description: "", courseID: "" });
        setEditingId(null);
    };

    const handleSubmit = async () => {

        try {

            if (editingId == null) {
                await createLesson(form);
                alert("Lesson created.");
            }
            else {
                await updateLesson(editingId, form);
                alert("Lesson updated.");
            }

            resetForm();
            loadLessons();

        }
        catch (err) {
            console.log(err);
            alert("Operation failed.");
        }

    };

    const handleEdit = (lesson) => {

        setEditingId(lesson.lessonID);

        setForm({
            title: lesson.title,
            description: lesson.description,
            courseID: lesson.courseID
        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this lesson?"))
            return;

        await deleteLesson(id);
        loadLessons();

    };

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Lesson Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
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

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">

                    <div className="field">
                        <label>Lesson Title</label>
                        <input
                            name="title"
                            placeholder="Lesson Title"
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

                </div>

                {canManage && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        {/* ...existing form-grid... */}
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {editingId == null ? "Add Course" : "Update Course"}
                        </button>
                        {editingId != null && (
                            <button className="btn btn-outline" style={{ marginLeft: 8 }} onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                )}

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
                        <th>Course</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {
                        lessons.map(lesson => (
                            <tr key={lesson.lessonID}>
                                <td>{lesson.lessonID}</td>
                                <td>{lesson.title}</td>
                                <td>{lesson.description}</td>
                                <td>{lesson.courseTitle}</td>
                                <td>
                                    {canManage && (
                                        <>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(course)}>
                                                Edit
                                            </button>{" "}
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.courseID)}>
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

        </div>

    );

}

export default Lesson;