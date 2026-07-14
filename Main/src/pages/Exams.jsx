import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getExams,
    createExam,
    updateExam,
    deleteExam
} from "../services/ExamService";

import { getCourses } from "../services/CourseService";
import BackButton from "../components/BackButton";

function Exam() {

    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const canManage = role === "Admin" || role === "Trainer";

    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        courseID: "",
        questionCount: 5   // NEW — only used when creating
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
        setForm({ title: "", courseID: "", questionCount: 5 });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingId == null) {
                const res = await createExam({
                    title: form.title,
                    courseID: form.courseID
                });

                const count = Math.max(1, Math.min(50, Number(form.questionCount) || 1));

                resetForm();

                // Send the trainer straight into Question Bank to fill in
                // exactly `count` blank questions for this new exam.
                navigate(`/questions?examId=${res.data.examID}&count=${count}`);
                return;
            }
            else {
                await updateExam(editingId, {
                    title: form.title,
                    courseID: form.courseID
                });
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
            courseID: exam.courseID,
            questionCount: 5
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

            {canManage && (
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

                        {editingId == null && (
                            <div className="field">
                                <label>Number of Questions</label>
                                <input
                                    type="number"
                                    name="questionCount"
                                    min="1"
                                    max="50"
                                    value={form.questionCount}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

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
            )}

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
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate(`/exams/${exam.examID}/take`)}
                                    >
                                        Take Exam
                                    </button>{" "}

                                    {canManage && (
                                        <>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => navigate(`/questions?examId=${exam.examID}`)}
                                            >
                                                Manage Questions
                                            </button>{" "}
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

export default Exam;