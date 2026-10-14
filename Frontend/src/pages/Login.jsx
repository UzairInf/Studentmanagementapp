import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Login failed"
                );
            }

            if (!data.token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("token", data.token);
            window.dispatchEvent(new Event("auth-login"));
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login">
            <aside className="login__hero">
                <div className="login__hero-text">
                    <h2 className="login__hero-title">Welcome Back</h2>
                    <p className="login__hero-copy">
                        Manage students, classes and results in one place.
                    </p>
                </div>

                <ul className="login__features">
                    <li className="login__feature">Track attendance</li>
                    <li className="login__feature">Manage grades</li>
                    <li className="login__feature">Stay organized</li>
                </ul>
            </aside>

            <section className="login__panel">
                <div className="login__card">
                    <p className="login__brand">Student Management</p>
                    <h1 className="login__title">Log In</h1>
                    <p className="login__subtitle">
                        Enter your username and password to continue.
                    </p>

                    <form className="login__form" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Username"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="login__field">
                            <label htmlFor="password">Password</label>
                            <div className="login__password">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login__toggle"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((visible) => !visible)}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {showPassword && <path d="M3 3l18 18" />}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="login__error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="login__submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="login__footer">
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;