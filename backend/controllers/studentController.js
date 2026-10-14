
const db = require("../db");

const getStudents = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = "SELECT * FROM students";
        let values = [];

        if (search) {
            sql = `
                SELECT * FROM students
                WHERE name ILIKE $1
                OR email ILIKE $1
                OR course ILIKE $1
                ORDER BY id
            `;
            values = [`%${search}%`];
        }

        const result = await db.query(sql, values);
        res.json(result.rows);
    } catch (err) {
        console.error("Get students error:", err.message);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

const addStudent = async (req, res) => {
    const { name, age, email, course } = req.body;

    if (!name || age === undefined || age === null || !email || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    if (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 100) {
        return res.status(400).json({
            error: "Age must be an integer between 1 and 100"
        });
    }

    try {
        const result = await db.query(
            `INSERT INTO students (name, age, email, course)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name, Number(age), email, course]
        );

        res.status(201).json({
            message: "Student added successfully",
            id: result.rows[0].id
        });
    } catch (err) {
        console.error("Add student error:", err.message);
        res.status(500).json({ error: "Failed to add student" });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            "DELETE FROM students WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        console.error("Delete student error:", err.message);
        res.status(500).json({ error: "Failed to delete student" });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, age, email, course } = req.body;

    if (!name || age === undefined || age === null || !email || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    if (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 100) {
        return res.status(400).json({
            error: "Age must be an integer between 1 and 100"
        });
    }

    try {
        const result = await db.query(
            `UPDATE students
             SET name = $1, age = $2, email = $3, course = $4
             WHERE id = $5
             RETURNING id`,
            [name, Number(age), email, course, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({ message: "Student updated successfully" });
    } catch (err) {
        console.error("Update student error:", err.message);
        res.status(500).json({ error: "Failed to update student" });
    }
};

module.exports = {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudent
};
