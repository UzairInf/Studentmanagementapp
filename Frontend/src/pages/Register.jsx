jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
        setMessage("");
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: {
                    data: {
                        username: form.username.trim()
                    }
                }
            });
            console.log("SUPABASE SIGNUP DATA:", data);
            console.log("SUPABASE SIGNUP ERROR:", error);

            if (error) {
                throw error;
            }

            console.log("Signup user:", data.user);
            console.log("Signup session:", data.session);

            if (data.session) {
                setMessage("Account created successfully!");

                navigate("/login", { replace: true });
            } else {
                setMessage(
                    "Account created! Check your email to confirm your account before logging in."
                );
            }
        } catch (err) {
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1>Student Management</h1>
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Choose a password (at least 6 characters)"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            {error && <p className="error">{error}</p>}
            {message && <p>{message}</p>}

            <p>
                Already have an account?{" "}
                <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default Register;
