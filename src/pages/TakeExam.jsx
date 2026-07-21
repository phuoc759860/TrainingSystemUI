import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExam, submitExam } from "../services/ExamService";
import { getQuestions } from "../services/QuestionService";
import Toast from "../components/Toast";

function TakeExam() {
    const { examId } = useParams();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadExam();
    }, [examId]);

    const loadExam = async () => {
        setLoading(true);
        setError("");
        try {
            const [examRes, questionsRes] = await Promise.all([
                getExam(examId),
                getQuestions(examId)
            ]);
            setExam(examRes.data);
            setQuestions(questionsRes.data);
        }
        catch (err) {
            console.log(err);
            setError("Unable to load this exam. You may not be enrolled in its course.");
        }
        finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionID, value) => {
        setAnswers(prev => ({ ...prev, [questionID]: value }));
    };

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !answers[q.questionID]?.trim());

        if (unanswered.length > 0) {
            if (!window.confirm(
                `You have ${unanswered.length} unanswered question(s). Submit anyway?`
            )) {
                return;
            }
        }

        setSubmitting(true);

        try {
            const payload = questions.map(q => ({
                questionID: q.questionID,
                answer: answers[q.questionID] || ""
            }));

            const res = await submitExam(examId, payload);
            setResult(res.data);
        }
        catch (err) {
            console.log(err);
            setToast({ message: "Failed to submit exam.", type: "error" });
        }
        finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-row">
                    <span className="spinner" /> Loading exam...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="welcome-banner">
                    <h2>Exam Unavailable</h2>
                    <p>{error}</p>
                </div>
                <div className="card empty-state">
                    <div className="empty-icon">⚠️</div>
                    <p style={{ color: "var(--danger)" }}>{error}</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="page">
                <div className="welcome-banner">
                    <h2>Exam Complete! 🎉</h2>
                    <p>Here are your results for {exam?.title}</p>
                </div>

                <div className="stat-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card stat-card-purple">
                        <div className="num" style={{ color: "#fff" }}>{result.score}%</div>
                        <div className="label" style={{ color: "rgba(255,255,255,.9)" }}>Score</div>
                    </div>
                    <div className="stat-card stat-card-blue">
                        <div className="num" style={{ color: "#fff" }}>{result.correctCount}/{result.totalQuestions}</div>
                        <div className="label" style={{ color: "rgba(255,255,255,.9)" }}>Correct</div>
                    </div>
                    <div className={`stat-card ${result.passed ? "stat-card-green" : "stat-card-coral"}`}>
                        <span
                            className="badge"
                            style={{ fontSize: 16, background: "rgba(255,255,255,.2)", color: "#fff" }}
                        >
                            {result.passed ? "✓ Passed" : "✗ Failed"}
                        </span>
                        <div className="label" style={{ color: "rgba(255,255,255,.9)" }}>Status</div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700 }}>Question Breakdown</h3>

                    {result.questions.map((q, i) => (
                        <div
                            key={q.questionID}
                            style={{
                                padding: "16px 0",
                                borderBottom: i < result.questions.length - 1 ? "1px solid var(--border)" : "none"
                            }}
                        >
                            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
                                {i + 1}. {q.content}
                            </p>

                            <p style={{ margin: "4px 0", fontSize: 14, color: "var(--ink-soft)" }}>
                                Your answer: <strong style={{ color: "var(--ink)" }}>{q.selectedAnswer || "(no answer)"}</strong>
                            </p>

                            {q.isCorrect !== null ? (
                                <>
                                    <p style={{ margin: "4px 0", fontSize: 14, color: "var(--ink-soft)" }}>
                                        Correct answer: <strong style={{ color: "var(--ink)" }}>{q.correctAnswer}</strong>
                                    </p>
                                    <span className={`badge ${q.isCorrect ? "badge-success" : "badge-danger"}`}>
                                        {q.isCorrect ? `+${q.pointsEarned} pts` : "Incorrect"}
                                    </span>
                                </>
                            ) : (
                                <span className="badge" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>Pending review</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="welcome-banner">
                <h2>{exam?.title} 📝</h2>
                <p>{exam?.courseTitle} — Answer all questions and submit when ready</p>
            </div>

            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 0 }}>Questions</h2>
                </div>
            </div>

            {questions.length === 0 && (
                <div className="card">
                    <p>This exam doesn't have any questions yet.</p>
                </div>
            )}

            {questions.map((q, i) => (
                <div key={q.questionID} className="card" style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>
                        {i + 1}. {q.content}{" "}
                        <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
                            ({q.score} pts)
                        </span>
                    </p>

                    {q.questionType === "MultipleChoice" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {["A", "B", "C", "D"].map(letter => {
                                const optionText = q[`option${letter}`];
                                if (!optionText) return null;

                                return (
                                    <label
                                        key={letter}
                                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.questionID}`}
                                            value={letter}
                                            checked={answers[q.questionID] === letter}
                                            onChange={() => handleAnswerChange(q.questionID, letter)}
                                        />
                                        <span>{letter}. {optionText}</span>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <textarea
                            rows="4"
                            placeholder="Type your answer..."
                            value={answers[q.questionID] || ""}
                            onChange={(e) => handleAnswerChange(q.questionID, e.target.value)}
                        />
                    )}
                </div>
            ))}

            {questions.length > 0 && (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Exam"}
                </button>
            )}

            <Toast toast={toast} onDone={() => setToast(null)} />
        </div>
    );
}

export default TakeExam;
