import { useEffect, useState } from "react";
import {
    getEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
} from "../services/EnrollmentService";

import { getUsers } from "../services/UserService";
import { getCourses } from "../services/CourseService";
import BackButton from "../components/BackButton";

function Enrollment() {

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

    const resetForm = () => {
        setForm({ userID: "", courseID: "", status: "In Progress" });
        setEditingId(null);
    };

    const handleSubmit = async () => {

        try {

            if (editingId == null) {
                await createEnrollment(form);
                alert("Enrollment created.");
            }
            else {
                await updateEnrollment(editingId, { status: form.status });
                alert("Enrollment updated.");
            }

            resetForm();
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

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Enrollment Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">

                    <div className="field">
                        <label>User</label>
                        <select
                            name="userID"
                            value={form.userID}
                            onChange={handleChange}
                            disabled={editingId != null}
                        >
                            <option value="">Select User</option>
                            {
                                users.map(user => (
                                    <option key={user.userID} value={user.userID}>
                                        {user.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="field">
                        <label>Course</label>
                        <select
                            name="courseID"
                            value={form.courseID}
                            onChange={handleChange}
                            disabled={editingId != null}
                        >
                            <option value="">Select Course</option>
                            {
                                courses.map(course => (
                                    <option key={course.courseID} value={course.courseID}>
                                        {course.title}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="field">
                        <label>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                    </div>

                </div>

                <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingId == null ? "Add Enrollment" : "Update Enrollment"}
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
                        <th>User</th>
                        <th>Course</th>
                        <th>Enroll Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {
                        enrollments.map(enrollment => (
                            <tr key={enrollment.enrollmentID}>
                                <td>{enrollment.enrollmentID}</td>
                                <td>{enrollment.userName}</td>
                                <td>{enrollment.courseTitle}</td>
                                <td>{new Date(enrollment.enrollDate).toLocaleDateString()}</td>
                                <td>
                                    <span className={
                                        enrollment.status === "Completed" ? "badge badge-success" :
                                        enrollment.status === "Dropped" ? "badge badge-danger" :
                                        "badge"
                                    }>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(enrollment)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
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