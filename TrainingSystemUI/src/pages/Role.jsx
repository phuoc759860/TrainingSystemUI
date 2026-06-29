import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from "../services/roleService";
import BackButton from "../components/BackButton";

function Role() {

    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {

        try {

            const res = await getRoles();

            setRoles(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    const handleSubmit = async () => {

        if (roleName.trim() === "") {

            alert("Role name is required.");

            return;

        }

        try {

            if (editingId == null) {

                await createRole({
                    roleName
                });

            } else {

                await updateRole(editingId, {
                    roleName
                });

                setEditingId(null);

            }

            setRoleName("");

            loadRoles();

        } catch (err) {

            console.log(err);

        }

    };

    const handleEdit = (role) => {

        setEditingId(role.roleID);

        setRoleName(role.roleName);

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this role?"))
            return;

        await deleteRole(id);

        loadRoles();

    };

    return (

        <div style={{ padding: "30px" }}>
            <BackButton />

            <h2>Role Management</h2>

            <hr />

            <input
                placeholder="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
            />

            <button onClick={handleSubmit}>
                {editingId == null ? "Add" : "Update"}
            </button>

            <br /><br />

            <table border="1" cellPadding="10">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Name</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        roles.map(role => (

                            <tr key={role.roleID}>

                                <td>{role.roleID}</td>

                                <td>{role.roleName}</td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(role)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(role.roleID)}
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

export default Role;