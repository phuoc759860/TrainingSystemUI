import { useEffect, useState } from "react";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";
import { getRoles } from "../services/roleService";
import BackButton from "../components/BackButton";

function User() {

    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [roles, setRoles] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        roleID: ""
    });

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        const res = await getUsers();
        setUsers(res.data);
    };

    const loadRoles = async () => {
        const res = await getRoles();
        setRoles(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({ name: "", email: "", password: "", roleID: "" });
        setEditingId(null);
    };

    const handleSubmit = async () => {

        try {

            if (editingId == null) {
                await createUser(form);
                alert("User created.");
            }
            else {
                await updateUser(editingId, form);
                alert("User updated.");
            }

            resetForm();
            loadUsers();

        }
        catch (err) {
            console.log(err);
            alert("Operation failed.");
        }

    };

    const handleEdit = (user) => {

        setEditingId(user.userID);

        setForm({
            name: user.name,
            email: user.email,
            password: "",
            roleID: user.roleID
        });

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this user?"))
            return;

        await deleteUser(id);
        loadUsers();

    };

    return (

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>User Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">

                    <div className="field">
                        <label>Name</label>
                        <input
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label>Email</label>
                        <input
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label>
                            {editingId == null ? "Password" : "New Password (optional)"}
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label>Role</label>
                        <select
                            name="roleID"
                            value={form.roleID}
                            onChange={handleChange}
                        >
                            <option value="">Select Role</option>
                            {
                                roles.map(role => (
                                    <option key={role.roleID} value={role.roleID}>
                                        {role.roleName}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                </div>

                <button className="btn btn-primary" onClick={handleSubmit}>
                    {/* FIX: this always said "Add User" before, even while editing */}
                    {editingId == null ? "Add User" : "Update User"}
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {
                        users.map(user => (
                            <tr key={user.userID}>
                                <td>{user.userID}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.roleName}</td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(user.userID)}
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

export default User;