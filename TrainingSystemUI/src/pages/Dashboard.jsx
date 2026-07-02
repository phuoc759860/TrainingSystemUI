import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/");

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>Training System</h1>

            <hr />

            <h2>
                Welcome {user?.name}
            </h2>

            <p>
                Email: {user?.email}
            </p>

            <p>
                Role ID: {user?.roleID}
            </p>

            <hr />

            <h3>Modules</h3>

            <button onClick={() => navigate("/roles")}>
                Roles
            </button>

            <br /><br />

            <button onClick={() => navigate("/users")}>
                Users
            </button>

            <br /><br />

            <button onClick={() => navigate("/courses")}>
                Courses
            </button>

            <br /><br />

            <button 
                onClick={() => navigate("/lessons")}
                style ={{ background: "cyan", color: "black" }}
                >Lessons
            </button>

            <br /><br />

            <button onClick={() => navigate("/materials")}>
                Materials
            </button>

            <br /><br />

            <button onClick={() => navigate("/enrollment")}>
                Enrollment Management
            </button>

            <br /><br />

            <button onClick={() => navigate("/exams")}>
                Exams
            </button>

            <br /><br />

            <button onClick={() => navigate("/questions")}>
                Question Bank
            </button>

            <br /><br />

            <button onClick={() => navigate("/ExamResult")}>
                Exam Results
            </button>

            <br /><br /><br />

            <button
                style={{ background: "red", color: "white" }}
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );

}

export default Dashboard;