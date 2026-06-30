import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";
import { getRoles } from "../services/roleService";

function User() {

    const navigate = useNavigate();

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

    const handleSubmit = async () => {

        try {

            if (editingId == null) {

                await createUser(form);

                alert("User created.");

            }
            else {

                await updateUser(editingId, form);

                alert("User updated.");

                setEditingId(null);

            }

            setForm({
                name: "",
                email: "",
                password: "",
                roleID: ""
            });

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

        <div style={{ padding: "30px" }}>

            <button onClick={() => navigate("/dashboard")}>
                ← Back
            </button>

            <h2>User Management</h2>

            <hr />

            <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
            />

            <br /><br />

            <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />

            <br /><br />

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
            />

            <br /><br />

            <select
                name="roleID"
                value={form.roleID}
                onChange={handleChange}
            >

                <option value="">
                    Select Role
                </option>

                {
                    roles.map(role => (

                        <option
                            key={role.roleID}
                            value={role.roleID}
                        >
                            {role.roleName}
                        </option>

                    ))
                }

            </select>

            <br /><br />

            <button onClick={handleSubmit}>
                Add User
            </button>

            <hr />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Role</th>

                        <th>Actions</th>

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
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
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