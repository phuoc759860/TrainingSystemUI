import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "../services/questionService";

import { getExams } from "../services/ExamService.jsx";

function Question() {
    const navigate = useNavigate();

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

    const handleSubmit = async () => {

        try {

            if (editingId == null) {

                await createQuestion(form);

                alert("Question created.");

            } else {

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

            setEditingId(null);

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

        <div style={{padding:"30px"}}>

        <button onClick={()=>navigate("/dashboard")}>
        ← Back
        </button>

        <h2>Question Bank Management</h2>

        <hr/>

        <select
        name="examID"
        value={form.examID}
        onChange={handleChange}
        disabled={editingId!=null}
        >

        <option value="">Select Exam</option>

        {
        exams.map(exam=>(

        <option
        key={exam.examID}
        value={exam.examID}
        >

        {exam.title}

        </option>

        ))
        }

        </select>

        <br/><br/>

        <input
        name="content"
        placeholder="Question"
        value={form.content}
        onChange={handleChange}
        />

        <br/><br/>

        <select
        name="questionType"
        value={form.questionType}
        onChange={handleChange}
        >

        <option value="MultipleChoice">
        Multiple Choice
        </option>

        <option value="Essay">
        Essay
        </option>

        </select>

        <br/><br/>

        <input
        name="optionA"
        placeholder="Option A"
        value={form.optionA}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="optionB"
        placeholder="Option B"
        value={form.optionB}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="optionC"
        placeholder="Option C"
        value={form.optionC}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="optionD"
        placeholder="Option D"
        value={form.optionD}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="correctAnswer"
        placeholder="Correct Answer"
        value={form.correctAnswer}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        type="number"
        name="score"
        placeholder="Score"
        value={form.score}
        onChange={handleChange}
        />

        <br/><br/>

        <button onClick={handleSubmit}>

        {

        editingId==null

        ?

        "Add Question"

        :

        "Update Question"

        }

        </button>

        <hr/>

        <table border="1" cellPadding="10">

        <thead>

        <tr>

        <th>ID</th>
        <th>Exam</th>
        <th>Question</th>
        <th>Type</th>
        <th>Correct</th>
        <th>Score</th>
        <th>Actions</th>

        </tr>

        </thead>

        <tbody>

        {

        questions.map(question=>(

        <tr key={question.questionID}>

        <td>{question.questionID}</td>

        <td>{question.examTitle}</td>

        <td>{question.content}</td>

        <td>{question.questionType}</td>

        <td>{question.correctAnswer}</td>

        <td>{question.score}</td>

        <td>

        <button
        onClick={()=>handleEdit(question)}
        >

        Edit

        </button>

        {" "}

        <button
        onClick={()=>handleDelete(question.questionID)}
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
