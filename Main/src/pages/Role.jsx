import { useEffect, useState } from "react";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from "../services/RoleService";
import BackButton from "../components/BackButton";

function Role() {

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

    const resetForm = () => {
        setEditingId(null);
        setRoleName("");
    };

    const handleSubmit = async () => {

        if (roleName.trim() === "") {
            alert("Role name is required.");
            return;
        }

        try {

            if (editingId == null) {
                await createRole({ roleName });
            } else {
                await updateRole(editingId, { roleName });
            }

            resetForm();
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

        <div className="page">

            <div className="page-header">
                <div>
                    <BackButton />
                    <h2 style={{ marginTop: 12 }}>Role Management</h2>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-grid">
                    <div className="field">
                        <label>Role Name</label>
                        <input
                            placeholder="e.g. Trainer"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                    </div>
                </div>

                <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingId == null ? "Add Role" : "Update Role"}
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
                        <th></th>
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
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(role)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        className="btn btn-danger btn-sm"
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