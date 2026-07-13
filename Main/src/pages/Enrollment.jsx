import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
} from "../services/enrollmentService";

import { getUsers } from "../services/userService";
import { getCourses } from "../services/courseService";

function Enrollment() {

    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        userID: "",
        courseID: "",
        status: "In Progress"
    });

    useEffect(() => {

    loadEnrollments();

    loadUsers();

    loadCourses();

}, []);

    const loadEnrollments = async () => {

        const res = await getEnrollments();

        setEnrollments(res.data);

    };

    const loadUsers = async () => {

        const res = await getUsers();

        setUsers(res.data);

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

        try {

            if (editingId == null) {

                await createEnrollment(form);

                alert("Enrollment created.");

            }
            else {

                await updateEnrollment(editingId, {

                    status: form.status

                });

                alert("Enrollment updated.");

            }

            setEditingId(null);

            setForm({

                userID: "",

                courseID: "",

                status: "In Progress"

            });

            loadEnrollments();

        }

        catch {

            alert("Operation failed.");

        }

    };

    const handleEdit = (enrollment) => {

        setEditingId(enrollment.enrollmentID);

        setForm({

            userID: enrollment.userID,

            courseID: enrollment.courseID,

            status: enrollment.status

        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete enrollment?"))
            return;

        await deleteEnrollment(id);

        loadEnrollments();

    };

    return (

        <div style={{ padding: "30px" }}>

            <button onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <h2>Enrollment Management</h2>

            <hr />

            {/* User */}

            <select
                name="userID"
                value={form.userID}
                onChange={handleChange}
                disabled={editingId != null}
            >

                <option value="">
                    Select User
                </option>

                {

                    users.map(user => (

                        <option
                            key={user.userID}
                            value={user.userID}
                        >
                            {user.name}
                        </option>

                    ))

                }

            </select>

            <br /><br />

            {/* Course */}

            <select
                name="courseID"
                value={form.courseID}
                onChange={handleChange}
                disabled={editingId != null}
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

            {/* Status */}

            <select
                name="status"
                value={form.status}
                onChange={handleChange}
            >

                <option value="In Progress">
                    In Progress
                </option>

                <option value="Completed">
                    Completed
                </option>

                <option value="Dropped">
                    Dropped
                </option>

            </select>

            <br /><br />

            <button onClick={handleSubmit}>

                {

                    editingId == null

                        ? "Add Enrollment"

                        : "Update Enrollment"

                }

            </button>

            <hr />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>User</th>
                        <th>Course</th>
                        <th>Enroll Date</th>
                        <th>Status</th>
                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        enrollments.map(enrollment => (

                            <tr key={enrollment.enrollmentID}>

                                <td>
                                    {enrollment.enrollmentID}
                                </td>

                                <td>
                                    {enrollment.userName}
                                </td>

                                <td>
                                    {enrollment.courseTitle}
                                </td>

                                <td>
                                    {
                                        new Date(
                                            enrollment.enrollDate
                                        ).toLocaleDateString()
                                    }
                                </td>

                                <td>
                                    {enrollment.status}
                                </td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(enrollment)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(enrollment.enrollmentID)}
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

export default Enrollment;