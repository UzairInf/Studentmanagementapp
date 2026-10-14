
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function Dashboard() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({
        name: "",
        age: "",
        email: "",
        course: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Load students
    const getStudents = async (searchValue = "") => {
        setLoading(true);
        setError("");

        try {
            const data = await apiFetch(
                `/api/students?search=${encodeURIComponent(searchValue)}`
            );

            if (!Array.isArray(data)) {
                throw new Error("The server did not return a student list");
            }

            setStudents(data);
        } catch (err) {
            setError(err.message);
            console.error("Student loading error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-logout"));
        setStudents([]);
        navigate("/login", { replace: true });
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Add or update student
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !form.name.trim() ||
            !form.age ||
            !form.email.trim() ||
            !form.course.trim()
        ) {
            setError("Please fill in all fields.");
            return;
        }

        const age = Number(form.age);

        if (!Number.isInteger(age) || age < 1 || age > 100) {
            setError("Age must be a whole number from 1 to 100.");
            return;
        }

        try {
            const isEditing = editingId !== null;

            await apiFetch(
                isEditing
                    ? `/api/students/${editingId}`
                    : "/api/students",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...form,
                        age
                    })
                }
            );

            setForm({
                name: "",
                age: "",
                email: "",
                course: ""
            });

            setEditingId(null);
            await getStudents(search);
        } catch (err) {
            setError(err.message);
        }
    };

    // Start editing
    const handleEdit = (student) => {
        setEditingId(student.id);

        setForm({
            name: student.name,
            age: String(student.age),
            email: student.email,
            course: student.course
        });

        setError("");
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null);

        setForm({
            name: "",
            age: "",
            email: "",
            course: ""
        });

        setError("");
    };

    // Delete student
    const deleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            await apiFetch(`/api/students/${id}`, {
                method: "DELETE"
            });

            if (editingId === id) {
                cancelEdit();
            }

            await getStudents(search);
        } catch (err) {
            setError(err.message);
        }
    };

    // Search
    const handleSearch = (e) => {
        e.preventDefault();
        getStudents(search);
    };

    const clearSearch = () => {
        setSearch("");
        getStudents("");
    };

    return (
        <div className="dashboard">
            <header>
                <h1>Student Management Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <section className="student-summary">
                <h2>Total Students: {students.length}</h2>
            </section>

            <section className="student-form">
                <h2>{editingId !== null ? "Edit Student" : "Add Student"}</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Student name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={form.age}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="course"
                        placeholder="Course"
                        value={form.course}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        {editingId !== null ? "Update Student" : "Add Student"}
                    </button>

                    {editingId !== null && (
                        <button type="button" onClick={cancelEdit}>
                            Cancel Edit
                        </button>
                    )}
                </form>
            </section>

            {error && <p className="error">{error}</p>}

            <section className="student-list">
                <h2>Students</h2>

                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search name, email, or course"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="submit">Search</button>

                    <button type="button" onClick={clearSearch}>
                        Clear
                    </button>
                </form>

                {loading ? (
                    <p>Loading students...</p>
                ) : students.length === 0 ? (
                    <p>No students found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.age}</td>
                                        <td>{student.email}</td>
                                        <td>{student.course}</td>
                                        <td>
                                            <button onClick={() => handleEdit(student)}>
                                                Edit
                                            </button>

                                            <button onClick={() => deleteStudent(student.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
