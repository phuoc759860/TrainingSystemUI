import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson
} from "../services/LessonService";

import { getCourses } from "../services/CourseService";

function Lesson() {

    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);

    const [courses, setCourses] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");

    const [courseId, setCourseId] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        courseID: ""
    });

    useEffect(() => {

        loadLessons();

    }, [search, courseId]);

    const loadLessons = async () => {
        console.log("search =", search);
        console.log("courseId =", courseId);

        const res = await getLessons(search, courseId);
        console.log(res.data);
        setLessons(res.data);

    };

    const loadCourses = async () => {

        const res = await getCourses();

        setCourses(res.data);

    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async () => {

        try {

            if (editingId == null) {

                await createLesson(form);

                alert("Lesson created.");

            }

            else {

                await updateLesson(editingId, form);

                alert("Lesson updated.");

                setEditingId(null);

            }

            setForm({

                title: "",

                description: "",

                courseID: ""

            });

            loadLessons();

        }

        catch (err) {

            console.log(err);

            alert("Operation failed.");

        }

    };

    const handleEdit = (lesson) => {

        setEditingId(lesson.lessonID);

        setForm({

            title: lesson.title,

            description: lesson.description,

            courseID: lesson.courseID

        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this lesson?"))

            return;

        await deleteLesson(id);

        loadLessons();

    };

    return (

        <div style={{ padding: "30px" }}>

            <button
                onClick={() => navigate("/dashboard")}
            >
                ← Back
            </button>

            <h2>Lesson Management</h2>

            <hr />

            <input
                placeholder="Search lesson..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
            >
                <option value="">All Courses</option>

                {courses.map(c => (
                    <option
                        key={c.courseID}
                        value={c.courseID}
                    >
                        {c.title}
                    </option>
                ))}
            </select>

            <input

                name="title"

                placeholder="Lesson Title"

                value={form.title}

                onChange={handleChange}

            />

            <br /><br />

            <textarea

                name="description"

                rows="4"

                cols="40"

                placeholder="Description"

                value={form.description}

                onChange={handleChange}

            />

            <br /><br />

            <select

                name="courseID"

                value={form.courseID}

                onChange={handleChange}

            >

                <option value="">
                    Select Course
                </option>

                {

                    courses.map(course => (

                        <option

                            key={course.courseID}

                            value={course.courseID}

                        >

                            {course.title}

                        </option>

                    ))

                }

            </select>

            <br /><br />

            <button
                onClick={handleSubmit}
            >

                {

                    editingId == null

                        ? "Add Lesson"

                        : "Update Lesson"

                }

            </button>

            <hr />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Title</th>

                        <th>Description</th>

                        <th>Course</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        lessons.map(lesson => (

                            <tr key={lesson.lessonID}>

                                <td>{lesson.lessonID}</td>

                                <td>{lesson.title}</td>

                                <td>{lesson.description}</td>

                                <td>{lesson.courseTitle}</td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(lesson)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(lesson.lessonID)}
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

export default Lesson;