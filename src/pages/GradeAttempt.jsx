import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamAttempt, gradeExamAttempt } from "../services/ExamResultService";
import Toast from "../components/Toast";

function GradeAttempt() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [points, setPoints] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        load();
    }, [id]);

    const load = async () => {
        const res = await getExamAttempt(id);
        setAttempt(res.data);

        const initial = {};
        res.data.answers.forEach(a => {
            initial[a.examAnswerID] = a.pointsEarned;
        });
        setPoints(initial);
    };

    const handlePointsChange = (answerId, value, max) => {
        const clamped = Math.max(0, Math.min(Number(value) || 0, max));
        setPoints(prev => ({ ...prev, [answerId]: clamped }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                answers: attempt.answers
                    .filter(a => a.needsGrading)
                    .map(a => ({
                        examAnswerID: a.examAnswerID,
                        pointsEarned: points[a.examAnswerID] ?? 0
                    }))
            };

            await gradeExamAttempt(id, payload);
            setToast({ message: "Grading saved.", type: "success" });
            setTimeout(() => navigate("/exam-results"), 800);
        }
        catch (err) {
            console.log(err);
            setToast({ message: "Failed to save grading.", type: "error" });
        }
        finally {
            setSaving(false);
        }
    };

    if (!attempt) {
        return (
            <div className="page">
                <p>Loading attempt...</p>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 style={{ marginTop: 12 }}>{attempt.examTitle}</h2>
                    <p style={{ color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        {attempt.userName} · Submitted {new Date(attempt.submittedAt).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="num">{attempt.score}%</div>
                    <div className="label">Current Score</div>
                </div>
                <div className="stat-card">
                    <span className={`badge ${attempt.passed ? "badge-success" : "badge-danger"}`} style={{ fontSize: 16 }}>
                        {attempt.passed ? "Passed" : "Failed"}
                    </span>
                </div>
                <div className="stat-card">
                    <span className={`badge ${attempt.needsGrading ? "badge-danger" : "badge-success"}`} style={{ fontSize: 16 }}>
                        {attempt.needsGrading ? "Needs Grading" : "Fully Graded"}
                    </span>
                </div>
            </div>

            {attempt.answers.map((a, i) => (
                <div key={a.examAnswerID} className="card" style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                        {i + 1}. {a.content}{" "}
                        <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
                            ({a.maxScore} pts)
                        </span>
                    </p>

                    <p style={{ margin: "4px 0" }}>
                        Answer: <strong>{a.answer || "(no answer)"}</strong>
                    </p>

                    {a.questionType === "MultipleChoice" ? (
                        <>
                            <p style={{ margin: "4px 0" }}>
                                Correct answer: <strong>{a.correctAnswer}</strong>
                            </p>
                            <span className={`badge ${a.isCorrect ? "badge-success" : "badge-danger"}`}>
                                {a.isCorrect ? `+${a.pointsEarned} pts (auto-graded)` : "Incorrect (auto-graded)"}
                            </span>
                        </>
                    ) : (
                        <div className="field" style={{ maxWidth: 200 }}>
                            <label>Points Earned</label>
                            <input
                                type="number"
                                min="0"
                                max={a.maxScore}
                                value={points[a.examAnswerID] ?? 0}
                                onChange={(e) => handlePointsChange(a.examAnswerID, e.target.value, a.maxScore)}
                            />
                        </div>
                    )}
                </div>
            ))}

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Grading"}
            </button>

            <Toast toast={toast} onDone={() => setToast(null)} />
        </div>
    );
}

export default GradeAttempt;
