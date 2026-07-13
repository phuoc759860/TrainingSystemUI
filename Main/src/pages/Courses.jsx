import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/userService";

import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} from "../services/CourseService";

function Course() {

    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [trainers, setTrainers] = useState([]);

    const [search, setSearch] = useState("");

    const role = localStorage.getItem("role");

    const [form, setForm] = useState({
        title: "",
        description: "",
        trainerID: ""
    });

    useEffect(() => {
        loadCourses();
    }, [search]);

    useEffect(() => {
        if (role === "Admin") {
            loadTrainers();
        }
    }, []);

    const loadTrainers = async () => {

        const res = await getUsers();

        const trainerList = res.data.filter(
            u => u.roleName === "Trainer"
        );

        setTrainers(trainerList);

    };  

    const loadCourses = async () => {

        const res = await getCourses(search);

        setCourses(res.data);

    };

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async () => {

        const data = { ...form };

        if (role === "Trainer") {
            delete data.trainerID;
        }

        try {

            if (editingId == null) {

                await createCourse(data);

                alert("Course created.");

            } else {

                await updateCourse(editingId, data);

                alert("Course updated.");

                setEditingId(null);

            }

            setForm({
                title: "",
                description: "",
                trainerID: ""
            });

            loadCourses();

        }
        catch (err) {

            console.log(err);

            alert("Operation failed.");

        }
    };

    const handleEdit = (course) => {

        setEditingId(course.courseID);

        setForm({

            title: course.title,

            description: course.description,

            trainerID: course.trainerID

        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this course?"))
            return;

        await deleteCourse(id);

        loadCourses();

    };

    return (

        <div style={{ padding: "30px" }}>

            <button onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <h2>Course Management</h2>

            <hr />
            <input
                type="text"
                placeholder="Search course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <br /><br />

            <input

                name="title"

                placeholder="Course Title"

                value={form.title}

                onChange={handleChange}

            />

            <br /><br />

            <textarea

                name="description"

                placeholder="Description"

                rows="4"

                cols="40"

                value={form.description}

                onChange={handleChange}

            />
            <br /><br />
            
            {role === "Admin" && (
            <>
                <select
                    name="trainerID"
                    value={form.trainerID}
                    onChange={handleChange}
                >
                    <option value="">Select Trainer</option>

                    {trainers.map(trainer => (
                        <option
                            key={trainer.userID}
                            value={trainer.userID}
                        >
                            {trainer.name}
                        </option>
                    ))}
                </select>

                <br /><br />
            </>
        )}

            <button onClick={handleSubmit}>

                {editingId == null ? "Add Course" : "Update Course"}

            </button>

            <hr />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Title</th>

                        <th>Description</th>

                        <th>Trainer</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        courses.map(course => (

                            <tr key={course.courseID}>

                                <td>{course.courseID}</td>

                                <td>{course.title}</td>

                                <td>{course.description}</td>

                                <td>{course.trainerName}</td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(course)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(course.courseID)}
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

export default Course;