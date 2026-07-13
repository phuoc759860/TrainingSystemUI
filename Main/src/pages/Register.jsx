import { useEffect, useState } from "react";
import { register } from "../services/authService";
import { getRoles } from "../services/roleService";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function Register() {

    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        roleID: ""
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const res = await getRoles();
            setRoles(res.data);
        }
        catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await register(form);

            alert("Register successful!");

            navigate("/");

        }
        catch (err) {

            console.log(err);

            alert("Register failed.");

        }

    };

    return (

        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-alt)"
        }}>
            <div className="card" style={{ width: 400 }}>

                <BackButton />

                <h2>Register</h2>

                <form onSubmit={handleSubmit}>

                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>Name</label>
                        <input
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field" style={{ marginBottom: 18 }}>
                        <label>Role</label>
                        <select
                            name="roleID"
                            onChange={handleChange}
                            defaultValue=""
                            required
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
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Register
                    </button>

                </form>

            </div>
        </div>

    );

}

export default Register;