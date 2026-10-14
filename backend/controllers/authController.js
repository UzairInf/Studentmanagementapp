const bcrypt = require("bcrypt");
const db = require("../db");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, password)
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [username, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            error: "Username already exists"
                        });
                    }

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    id: result.insertId
                });
            }
        );
    } catch (err) {
        res.status(500).json({
            error: "Something went wrong"
        });
    }
};


const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token
        });
    });
};

module.exports = {
    register,
    login
};