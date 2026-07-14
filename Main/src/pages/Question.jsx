import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "../services/QuestionService";

import { getExams } from "../services/ExamService";
import BackButton from "../components/BackButton";

const blankQuestion = () => ({
    content: "",
    questionType: "MultipleChoice",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    score: 1
});

function Question() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const preselectedExamId = searchParams.get("examId") || "";
    const initialCount = Number(searchParams.get("count")) || 0;

    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);

    // Filter for the table / which exam we're managing
    const [filterExamId, setFilterExamId] = useState(preselectedExamId);

    // ---- Bulk create mode (triggered by ?examId=X&count=N from Exams.jsx) ----
    const [bulkMode, setBulkMode] = useState(initialCount > 1);
    const [bulkForms, setBulkForms] = useState(
        initialCount > 1 ? Array.from({ length: initialCount }, blankQuestion) : []
    );
    const [saving, setSaving] = useState(false);

    // ---- Single add/edit form (existing behavior) ----
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        examID: preselectedExamId,
        ...blankQuestion()
    });

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterExamId]);

    const loadQuestions = async () => {
        const res = await getQuestions(filterExamId);
        setQuestions(res.data);
    };

    const loadExams = async () => {
        const res = await getExams();
        setExams(res.data);
    };

    // ---------------- Single form handlers (unchanged logic) ----------------

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleTypeChange = (e) => {
        setForm({
            ...form,
            questionType: e.target.value,
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: ""
        });
    };

    const resetForm = () => {
        setForm({
            examID: filterExamId,
            ...blankQuestion()
        });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingId == null) {
                await createQuestion(form);
                alert("Question created.");
            }
            else {
                await updateQuestion(editingId, {
                    content: form.content,
                    questionType: form.questionType,
                    optionA: form.optionA,
                    optionB: form.optionB,
                    optionC: form.optionC,
                    optionD: form.optionD,
                    correctAnswer: form.correctAnswer,
                    score: Number(form.score)
                });
                alert("Question updated.");
            }

            resetForm();
            loadQuestions();
        }
        catch {
            alert("Operation failed.");
        }
    };

    const handleEdit = (question) => {
        setEditingId(question.questionID);
        setForm({
            examID: question.examID,
            content: question.content,
            questionType: question.questionType,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            score: question.score
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete question?"))
            return;

        await deleteQuestion(id);
        loadQuestions();
    };

    // ---------------- Bulk form handlers ----------------

    const handleBulkFieldChange = (index, field, value) => {
        setBulkForms(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleBulkTypeChange = (index, value) => {
        setBulkForms(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                questionType: value,
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctAnswer: ""
            };
            return updated;
        });
    };

    const handleBulkSubmit = async () => {
        if (!filterExamId) {
            alert("No exam selected.");
            return;
        }

        const hasEmpty = bulkForms.some(q => q.content.trim() === "");
        if (hasEmpty) {
            if (!window.confirm("Some questions have no text. Save anyway?")) {
                return;
            }
        }

        setSaving(true);

        try {
            for (const q of bulkForms) {
                await createQuestion({
                    ...q,
                    examID: filterExamId,
                    score: Number(q.score) || 1
                });
            }

            alert(`${bulkForms.length} question(s) created.`);
            setBulkMode(false);
            setBulkForms([]);
            navigate(`/questions?examId=${filterExamId}`, { replace: true });
            loadQuestions();
        }
        catch (err) {
            console.log(err);
            alert("Some questions failed to save. Check the list below — anything missing can be added with the form.");
            loadQuestions();
        }
        finally {
            setSaving(false);
        }
    };

    const cancelBulk = () => {
        if (!window.confirm("Discard these unsaved questions?"))
            return;

        setBulkMode(false);
        setBulkForms([]);
        navigate(`/questions${filterExamId ? `?examId=${filterExamId}` : ""}`, { replace: true });
    };

    const selectedExamTitle = exams.find(e => String(e.examID) === String(filterExamId))?.title;

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Question Bank Management</h2>
                </div>
            </div>

            {/* Exam selector — always visible, drives both the table and the single-add form */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">
                    <div className="field">
                        <label>Exam</label>
                        <select
                            value={filterExamId}
                            onChange={(e) => {
                                setFilterExamId(e.target.value);
                                setForm(f => ({ ...f, examID: e.target.value }));
                            }}
                        >
                            <option value="">All Exams</option>
                            {
                                exams.map(exam => (
                                    <option key={exam.examID} value={exam.examID}>
                                        {exam.title}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>

            {/* -------- Bulk fill-in form (only right after creating an exam) -------- */}
            {bulkMode && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginTop: 0 }}>
                        Add {bulkForms.length} Question{bulkForms.length > 1 ? "s" : ""}
                        {selectedExamTitle ? ` for "${selectedExamTitle}"` : ""}
                    </h3>

                    {bulkForms.map((q, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{ marginBottom: 16, background: "var(--surface-alt)" }}
                        >
                            <p style={{ fontWeight: 600, marginBottom: 10 }}>Question {i + 1}</p>

                            <div className="form-grid">

                                <div className="field">
                                    <label>Question Type</label>
                                    <select
                                        value={q.questionType}
                                        onChange={(e) => handleBulkTypeChange(i, e.target.value)}
                                    >
                                        <option value="MultipleChoice">Multiple Choice</option>
                                        <option value="Essay">Essay</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>Score</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={q.score}
                                        onChange={(e) => handleBulkFieldChange(i, "score", e.target.value)}
                                    />
                                </div>

                                <div className="field" style={{ gridColumn: "1 / -1" }}>
                                    <label>Question</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Question text"
                                        value={q.content}
                                        onChange={(e) => handleBulkFieldChange(i, "content", e.target.value)}
                                    />
                                </div>

                                {q.questionType === "MultipleChoice" && (
                                    <>
                                        <div className="field">
                                            <label>Option A</label>
                                            <input
                                                value={q.optionA}
                                                onChange={(e) => handleBulkFieldChange(i, "optionA", e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Option B</label>
                                            <input
                                                value={q.optionB}
                                                onChange={(e) => handleBulkFieldChange(i, "optionB", e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Option C</label>
                                            <input
                                                value={q.optionC}
                                                onChange={(e) => handleBulkFieldChange(i, "optionC", e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Option D</label>
                                            <input
                                                value={q.optionD}
                                                onChange={(e) => handleBulkFieldChange(i, "optionD", e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Correct Answer</label>
                                            <select
                                                value={q.correctAnswer}
                                                onChange={(e) => handleBulkFieldChange(i, "correctAnswer", e.target.value)}
                                            >
                                                <option value="">Select correct option</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {q.questionType === "Essay" && (
                                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                                        <label>Model Answer / Grading Notes (optional)</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Optional notes for the grader — not shown to students"
                                            value={q.correctAnswer}
                                            onChange={(e) => handleBulkFieldChange(i, "correctAnswer", e.target.value)}
                                        />
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}

                    <button className="btn btn-primary" onClick={handleBulkSubmit} disabled={saving}>
                        {saving ? "Saving..." : `Save All ${bulkForms.length} Questions`}
                    </button>{" "}
                    <button className="btn btn-outline" onClick={cancelBulk} disabled={saving}>
                        Cancel
                    </button>
                </div>
            )}

            {/* -------- Single add/edit form (still available for adding one-offs later) -------- */}
            {!bulkMode && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="form-grid">

                        <div className="field">
                            <label>Exam</label>
                            <select
                                name="examID"
                                value={form.examID}
                                onChange={handleChange}
                                disabled={editingId != null}
                            >
                                <option value="">Select Exam</option>
                                {
                                    exams.map(exam => (
                                        <option key={exam.examID} value={exam.examID}>
                                            {exam.title}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label>Question Type</label>
                            <select
                                name="questionType"
                                value={form.questionType}
                                onChange={handleTypeChange}
                            >
                                <option value="MultipleChoice">Multiple Choice</option>
                                <option value="Essay">Essay</option>
                            </select>
                        </div>

                        <div className="field" style={{ gridColumn: "1 / -1" }}>
                            <label>Question</label>
                            <textarea
                                name="content"
                                rows="2"
                                placeholder="Question text"
                                value={form.content}
                                onChange={handleChange}
                            />
                        </div>

                        {form.questionType === "MultipleChoice" && (
                            <>
                                <div className="field">
                                    <label>Option A</label>
                                    <input name="optionA" placeholder="Option A" value={form.optionA} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label>Option B</label>
                                    <input name="optionB" placeholder="Option B" value={form.optionB} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label>Option C</label>
                                    <input name="optionC" placeholder="Option C" value={form.optionC} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label>Option D</label>
                                    <input name="optionD" placeholder="Option D" value={form.optionD} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label>Correct Answer</label>
                                    <select name="correctAnswer" value={form.correctAnswer} onChange={handleChange}>
                                        <option value="">Select correct option</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {form.questionType === "Essay" && (
                            <div className="field" style={{ gridColumn: "1 / -1" }}>
                                <label>Model Answer / Grading Notes (optional)</label>
                                <textarea
                                    name="correctAnswer"
                                    rows="2"
                                    placeholder="Optional notes for the grader — not shown to students"
                                    value={form.correctAnswer}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                    </div>

                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingId == null ? "Add Question" : "Update Question"}
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
                        <th>Exam</th>
                        <th>Question</th>
                        <th>Type</th>
                        <th>Correct</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {
                        questions.map(question => (
                            <tr key={question.questionID}>
                                <td>{question.questionID}</td>
                                <td>{question.examTitle}</td>
                                <td>{question.content}</td>
                                <td>{question.questionType}</td>
                                <td>{question.correctAnswer}</td>
                                <td>{question.score}</td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(question)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(question.questionID)}
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

export default Question;