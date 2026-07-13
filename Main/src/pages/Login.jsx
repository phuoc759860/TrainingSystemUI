import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // const handleLogin = async (e) => {
    
    //     e.preventDefault();

    //     try {

    //         const result = await login({
    //             email,
    //             password
    //         });

    //         console.log(result);
    //         localStorage.setItem("userID", result.userID);
    //         localStorage.setItem("name", result.name);
    //         localStorage.setItem("email", result.email);
    //         localStorage.setItem("roleID", result.roleID);
    //         localStorage.setItem("role", result.role);
    //         alert("Login successful!");
    //         console.log("Going to dashboard...");

    //         navigate("/dashboard");

    //     }
    //     catch (error) {
    //         console.log(error);

    //         if (error.response) {
    //             console.log("Status:", error.response.status);
    //             console.log("Data:", error.response.data);
    //             alert(error.response.data);
    //         } else {
    //             alert(error.message);
    //         }
    //     }

    // };

    const handleLogin = async (e) => {

        e.preventDefault();

        console.log("1. Login button clicked");

        try {

            const result = await login({
                email,
                password
            });

            console.log("2. Login result:", result);

            if (!result.token) {
                console.error("No token received from backend!");
                alert("Login failed: No token returned.");
                return;
            }

            // Save user information
            localStorage.setItem("token", result.token);
            localStorage.setItem("userID", result.userID);
            localStorage.setItem("name", result.name);
            localStorage.setItem("email", result.email);
            localStorage.setItem("roleID", result.roleID);
            localStorage.setItem("role", result.role);

            console.log("3. LocalStorage saved");

            console.log("Token:", localStorage.getItem("token"));
            console.log("Role:", localStorage.getItem("role"));

            alert("Login successful!");

            console.log("4. Going to dashboard...");

            navigate("/dashboard");

        }
        catch (error) {

            console.error("LOGIN ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
                alert(error.response.data);
            }
            else {
                alert(error.message);
            }
        }

    };

    return (

        <div style={{ width: "350px", margin: "80px auto" }}>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>
                <br /><br />

                <p>
                    Don't have an account?
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>
            </form>

        </div>

    );

}

export default Login;