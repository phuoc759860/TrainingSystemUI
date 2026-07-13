import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const result = await login({
                email,
                password
            });

            if (!result.token) {
                alert("Login failed: No token returned.");
                return;
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("userID", result.userID);
            localStorage.setItem("name", result.name);
            localStorage.setItem("email", result.email);
            localStorage.setItem("roleID", result.roleID);
            localStorage.setItem("role", result.role);

            navigate("/dashboard");

        }
        catch (error) {

            if (error.response) {
                alert(error.response.data);
            }
            else {
                alert(error.message);
            }
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
            <div className="card" style={{ width: 360 }}>

                <h2 style={{ marginTop: 0 }}>Login</h2>

                <form onSubmit={handleLogin}>

                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field" style={{ marginBottom: 18 }}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Login
                    </button>

                </form>

                <p style={{ marginTop: 18, marginBottom: 8, color: "var(--ink-soft)", fontSize: 14 }}>
                    Don't have an account?
                </p>

                <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: "100%" }}
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>

            </div>
        </div>

    );

}

export default Login;