const db = require("../db");

const getStudents = (req, res) => {
    const { search } = req.query;

    let sql = "SELECT * FROM students";
    let values = [];

    if (search) {
        sql = `
            SELECT * FROM students
            WHERE name LIKE ?
            OR email LIKE ?
            OR course LIKE ?
        `;

        const searchValue = `%${search}%`;
        values = [searchValue, searchValue, searchValue];
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
};

const addStudent = (req, res) => {
    const { name, age, email, course } = req.body;

    if (!name || !age || !email || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    if (age < 1 || age > 100) {
        return res.status(400).json({
            error: "Age must be between 1 and 100"
        });
    }

    const sql = `
        INSERT INTO students (name, age, email, course)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, age, email, course], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            message: "Student added successfully",
            id: result.insertId
        });
    });
};

const deleteStudent = (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM students WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Student deleted successfully"
            });
        }
    );
};

const updateStudent = (req, res) => {
    const { id } = req.params;
    const { name, age, email, course } = req.body;

    if (!name || !age || !email || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    if (age < 1 || age > 100) {
        return res.status(400).json({
            error: "Age must be between 1 and 100"
        });
    }

    const sql = `
        UPDATE students
        SET name = ?, age = ?, email = ?, course = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, age, email, course, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Student updated successfully"
            });
        }
    );
};

module.exports = {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudent
};