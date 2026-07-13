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

        <div style={{ width: "400px", margin: "50px auto" }}>

            <BackButton />

            <h2>Register</h2>

            <form onSubmit={handleSubmit}>

                <input
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <select
                    name="roleID"
                    onChange={handleChange}
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

                <br /><br />

                <button type="submit">

                    Register

                </button>

            </form>

        </div>

    );

}

export default Register;