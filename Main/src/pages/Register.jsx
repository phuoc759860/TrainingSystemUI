import { useEffect, useState } from "react";
import { register } from "../services/authService";
import { getRoles } from "../services/RoleService";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

function Register() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [toast, setToast] = useState(null);
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
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            setToast({ message: "Registration successful!", type: "success" });
            setTimeout(() => navigate("/login"), 800);
        } catch (err) {
            console.log(err);
            setToast({ message: "Registration failed.", type: "error" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-violet-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/25 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join TrainingHub and start learning</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                            <input
                                name="name"
                                placeholder="Your name"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                            <select
                                name="roleID"
                                onChange={handleChange}
                                defaultValue=""
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            >
                                <option value="">Select Role</option>
                                {roles.map(role => (
                                    <option key={role.roleID} value={role.roleID}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 rounded-xl bg-linear-to-t from-violet-600 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-700 hover:to-violet-600 active:scale-[0.98] transition-all"
                        >
                            Create account
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>

            <Toast toast={toast} onDone={() => setToast(null)} />
        </div>
    );
}

export default Register;
