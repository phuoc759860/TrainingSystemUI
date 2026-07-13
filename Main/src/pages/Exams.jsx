// Main/src/pages/Exams.jsx
import { useEffect, useState } from "react";
import {
    getExams,
    createExam,
    updateExam,
    deleteExam
} from "../services/ExamService";

import { getCourses } from "../services/CourseService";
import BackButton from "../components/BackButton";

function Exam() {

    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        courseID: ""
    });

    useEffect(() => {
        loadExams();
        loadCourses();
    }, []);

    const loadExams = async () => {
        const res = await getExams();
        setExams(res.data);
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
        setForm({ title: "", courseID: "" });
        setEditingId(null);
    };

    const handleSubmit = async () => {

        try {

            if (editingId == null) {
                await createExam(form);
                alert("Exam created.");
            }
            else {
                await updateExam(editingId, form);
                alert("Exam updated.");
            }

            resetForm();
            loadExams();

        }
        catch {
            alert("Operation failed.");
        }

    };

    const handleEdit = (exam) => {

        setEditingId(exam.examID);

        setForm({
            title: exam.title,
            courseID: exam.courseID
        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete exam?"))
            return;

        await deleteExam(id);
        loadExams();

    };

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Exam Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">

                    <div className="field">
                        <label>Exam Title</label>
                        <input
                            name="title"
                            placeholder="Exam Title"
                            value={form.title}
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

                <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingId == null ? "Add Exam" : "Update Exam"}
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
                        <th>Course</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {
                        exams.map(exam => (
                            <tr key={exam.examID}>
                                <td>{exam.examID}</td>
                                <td>{exam.title}</td>
                                <td>{exam.courseTitle}</td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(exam)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(exam.examID)}
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

export default Exam;