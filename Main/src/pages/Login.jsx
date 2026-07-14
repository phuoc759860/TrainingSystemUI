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
            background: "linear-gradient(160deg, var(--surface-alt) 0%, var(--brand-bg) 100%)"
        }}>
            <div className="card" style={{ width: 380, boxShadow: "var(--shadow-lg)" }}>

                <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <div style={{
                        width: 44, height: 44,
                        margin: "0 auto 14px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--accent)", fontFamily: "var(--font-display)",
                        fontSize: 20, fontWeight: 700, boxShadow: "var(--shadow)"
                    }}>
                        T
                    </div>
                    <h2 style={{ margin: 0 }}>Welcome back</h2>
                    <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "6px 0 0" }}>
                        Sign in to your training account
                    </p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="field" style={{ marginBottom: 14 }}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field" style={{ marginBottom: 20 }}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Sign in
                    </button>

                </form>

                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    margin: "22px 0 16px", color: "var(--ink-soft)", fontSize: 12.5
                }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    New here?
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: "100%" }}
                    onClick={() => navigate("/register")}
                >
                    Create an account
                </button>

            </div>
        </div>

    );

}

export default Login;