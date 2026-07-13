// Main/src/pages/Question.jsx
import { useEffect, useState } from "react";
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "../services/QuestionService";

import { getExams } from "../services/ExamService";
import BackButton from "../components/BackButton";

function Question() {

    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        examID: "",
        content: "",
        questionType: "MultipleChoice",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        score: 1
    });

    useEffect(() => {
        loadQuestions();
        loadExams();
    }, []);

    const loadQuestions = async () => {
        const res = await getQuestions();
        setQuestions(res.data);
    };

    const loadExams = async () => {
        const res = await getExams();
        setExams(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({
            examID: "",
            content: "",
            questionType: "MultipleChoice",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            score: 1
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

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Question Bank Management</h2>
                </div>
            </div>

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
                            onChange={handleChange}
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
                        <input name="correctAnswer" placeholder="Correct Answer" value={form.correctAnswer} onChange={handleChange} />
                    </div>

                    <div className="field">
                        <label>Score</label>
                        <input type="number" name="score" placeholder="Score" value={form.score} onChange={handleChange} />
                    </div>

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