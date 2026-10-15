
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

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


    const getStudents = async (searchValue = "") => {
        setLoading(true);
        setError("");

        try {
            let query = supabase
                .from("students")
                .select("*")
                .order("id", { ascending: true });

            if (searchValue.trim()) {
                const term = searchValue.trim();
                query = query.or(
                    `name.ilike.%${term}%,email.ilike.%${term}%,course.ilike.%${term}%`
                );
            }

            const { data, error } = await query;
            console.log("Students from Supabase:", data);
            console.log("Supabase query error:", error);

            if (error) {
                throw error;
            }

            setStudents(data ?? []);
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


    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setError(error.message);
            return;
        }

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
            const student = {
                name: form.name.trim(),
                age,
                email: form.email.trim(),
                course: form.course.trim()
            };

            if (editingId !== null) {
                const { error } = await supabase
                    .from("students")
                    .update(student)
                    .eq("id", editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("students")
                    .insert([student]);

                if (error) throw error;
            }

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
            console.error("Saving student error:", err);
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


    const deleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            const { error } = await supabase
                .from("students")
                .delete()
                .eq("id", id);

            if (error) throw error;

            if (editingId === id) {
                cancelEdit();
            }

            await getStudents(search);
        } catch (err) {
            setError(err.message);
            console.error("Deleting student error:", err);
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
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id}>
                                        <td>{index + 1}</td>
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
