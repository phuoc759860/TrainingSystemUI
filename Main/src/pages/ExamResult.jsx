import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExamResults, createExamResult, updateExamResult, deleteExamResult } from "../services/ExamResultService";
import { getUsers } from "../services/UserService";
import { getExams } from "../services/ExamService";

function ExamResult() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [exams, setExams] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ userID: "", examID: "", score: "" });

    useEffect(() => { loadResults(); loadUsers(); loadExams(); }, []);
    const loadResults = async () => setResults((await getExamResults()).data);
    const loadUsers = async () => setUsers((await getUsers()).data);
    const loadExams = async () => setExams((await getExams()).data);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            const data = { userID: Number(form.userID), examID: Number(form.examID), score: Number(form.score) };
            if (editingId == null) { await createExamResult(data); alert("Result created."); }
            else { await updateExamResult(editingId, data); alert("Result updated."); }
            setEditingId(null);
            setForm({ userID: "", examID: "", score: "" });
            loadResults();
        } catch (err) {
            console.log(err.response?.data);
            alert("Operation failed.");
        }
    };

    const handleEdit = (r) => { setEditingId(r.resultID); setForm({ userID: r.userID, examID: r.examID, score: r.score }); };
    const handleDelete = async (id) => { if (!window.confirm("Delete result?")) return; await deleteExamResult(id); loadResults(); };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate("/dashboard")}>← Back</button>
                    <h2 style={{ marginTop: 12 }}>Exam Result Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">
                    <div className="field">
                        <label>User</label>
                        <select name="userID" value={form.userID} onChange={handleChange}>
                            <option value="">Select User</option>
                            {users.map(u => <option key={u.userID} value={u.userID}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label>Exam</label>
                        <select name="examID" value={form.examID} onChange={handleChange}>
                            <option value="">Select Exam</option>
                            {exams.map(e => <option key={e.examID} value={e.examID}>{e.title}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label>Score</label>
                        <input type="number" name="score" min="0" max="100" placeholder="0–100" value={form.score} onChange={handleChange} />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingId == null ? "Add Result" : "Update Result"}
                </button>
            </div>

            <table className="table-modern">
                <thead><tr><th>ID</th><th>User</th><th>Exam</th><th>Score</th><th>Status</th><th>Grading</th><th>Submitted</th><th></th></tr></thead>
                <tbody>
                    {results.map(r => (
                        <tr key={r.resultID}>
                            <td>{r.resultID}</td><td>{r.userName}</td><td>{r.examTitle}</td><td>{r.score}</td>
                            <td><span className={`badge ${r.passed ? "badge-success" : "badge-danger"}`}>{r.passed ? "Passed" : "Failed"}</span></td>
                            <td>
                                {r.needsGrading
                                    ? <span className="badge badge-danger">Needs Grading</span>
                                    : <span className="badge badge-success">Graded</span>}
                            </td>
                            <td>{new Date(r.submittedAt).toLocaleString()}</td>
                            <td>
                                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/exam-results/${r.resultID}/grade`)}>
                                    {r.needsGrading ? "Grade" : "View"}
                                </button>{" "}
                                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(r)}>Edit</button>{" "}
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.resultID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default ExamResult;