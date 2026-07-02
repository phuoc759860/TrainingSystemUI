import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getExams,
    createExam,
    updateExam,
    deleteExam
} from "../services/ExamService.jsx";

import { getCourses } from "../services/courseService";

function Exam() {

    const navigate = useNavigate();

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

    const handleSubmit = async () => {

        try{

            if(editingId == null){

                await createExam(form);

                alert("Exam created.");

            }
            else{

                await updateExam(editingId, form);

                alert("Exam updated.");

                setEditingId(null);

            }

            setForm({

                title:"",

                courseID:""

            });

            loadExams();

        }

        catch{

            alert("Operation failed.");

        }

    };

    const handleEdit = (exam)=>{

        setEditingId(exam.examID);

        setForm({

            title:exam.title,

            courseID:exam.courseID

        });

    };

    const handleDelete = async(id)=>{

        if(!window.confirm("Delete exam?"))
            return;

        await deleteExam(id);

        loadExams();

    };

    return (

        <div style={{padding:"30px"}}>

        <button
        onClick={()=>navigate("/dashboard")}
        >

        ← Back

        </button>

        <h2>Exam Management</h2>

        <hr/>

        <input

        name="title"

        placeholder="Exam Title"

        value={form.title}

        onChange={handleChange}

        />

        <br/><br/>

        <select

        name="courseID"

        value={form.courseID}

        onChange={handleChange}

        >

        <option value="">

        Select Course

        </option>

        {

        courses.map(course=>(

        <option

        key={course.courseID}

        value={course.courseID}

        >

        {course.title}

        </option>

        ))

        }

        </select>

        <br/><br/>

        <button
        onClick={handleSubmit}
        >

        {

        editingId==null

        ?

        "Add Exam"

        :

        "Update Exam"

        }

        </button>

        <hr/>

        <table border="1" cellPadding="10">

        <thead>

        <tr>

        <th>ID</th>

        <th>Title</th>

        <th>Course</th>

        <th>Actions</th>

        </tr>

        </thead>

        <tbody>

        {

        exams.map(exam=>(

        <tr key={exam.examID}>

        <td>{exam.examID}</td>

        <td>{exam.title}</td>

        <td>{exam.courseTitle}</td>

        <td>

        <button
        onClick={()=>handleEdit(exam)}
        >

        Edit

        </button>

        {" "}

        <button
        onClick={()=>handleDelete(exam.examID)}
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