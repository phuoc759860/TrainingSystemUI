import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getExamResults,
    createExamResult,
    updateExamResult,
    deleteExamResult
} from "../services/examResultService";

import { getUsers } from "../services/userService";
import { getExams } from "../services/ExamService.jsx";

function ExamResult() {

    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [exams, setExams] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        userID: "",
        examID: "",
        score: ""
    });
    const loadResults = async () => {

        const res = await getExamResults();

        setResults(res.data);

    };

    useEffect(() => {

        loadResults();

        loadUsers();

        loadExams();

    }, []);

    const loadUsers = async () => {

        const res = await getUsers();

        setUsers(res.data);

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

            const data = {
                userID: Number(form.userID),
                examID: Number(form.examID),
                score: Number(form.score)
            };

            if (editingId == null) {

                await createExamResult(data);

                alert("Result created.");

            } else {

                await updateExamResult(editingId, data);

                alert("Result updated.");

            }

            setEditingId(null);

            setForm({
                userID: "",
                examID: "",
                score: ""
            });

            loadResults();

        }
        catch (err) {

            console.log(err.response?.data);

            alert("Operation failed.");

        }

    };

    const handleEdit = (result) => {

        setEditingId(result.resultID);

        setForm({

            userID: result.userID,

            examID: result.examID,

            score: result.score

        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete result?"))
            return;

        await deleteExamResult(id);

        loadResults();

    };

    return (

        <div style={{padding:"30px"}}>

        <button
        onClick={()=>navigate("/dashboard")}
        >

        ← Back

        </button>

        <h2>Exam Result Management</h2>

        <hr/>

        <select

        name="userID"

        value={form.userID}

        onChange={handleChange}

        >

        <option value="">Select User</option>

        {

        users.map(user=>(

        <option

        key={user.userID}

        value={user.userID}

        >

        {user.name}

        </option>

        ))

        }

        </select>

        <br/><br/>

        <select

        name="examID"

        value={form.examID}

        onChange={handleChange}

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

        type="number"

        name="score"

        placeholder="Score"

        value={form.score}

        onChange={handleChange}

        />

        <br/><br/>

        <button
        onClick={handleSubmit}
        >

        {

        editingId==null

        ?

        "Add Result"

        :

        "Update Result"

        }

        </button>

        <hr/>

        <table border="1" cellPadding="10">

        <thead>

        <tr>

        <th>ID</th>

        <th>User</th>

        <th>Exam</th>

        <th>Score</th>

        <th>Passed</th>

        <th>Submitted</th>

        <th>Actions</th>

        </tr>

        </thead>

        <tbody>

        {

        results.map(result=>(

        <tr key={result.resultID}>

        <td>{result.resultID}</td>

        <td>{result.userName}</td>

        <td>{result.examTitle}</td>

        <td>{result.score}</td>

        <td>

        {

        result.passed

        ?

        "✅ Passed"

        :

        "❌ Failed"

        }

        </td>

        <td>

        {

        new Date(result.submittedAt)

        .toLocaleString()

        }

        </td>

        <td>

        <button

        onClick={()=>handleEdit(result)}

        >

        Edit

        </button>

        {" "}

        <button

        onClick={()=>handleDelete(result.resultID)}

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

export default ExamResult;