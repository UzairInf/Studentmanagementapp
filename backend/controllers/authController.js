
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

        const result = await db.query(
            `INSERT INTO users (username, password)
             VALUES ($1, $2)
             RETURNING id`,
            [username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            id: result.rows[0].id
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({
                error: "Username already exists"
            });
        }

        console.error("Registration error:", err.message);

        res.status(500).json({
            error: "Registration failed"
        });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
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
    } catch (err) {
        console.error("Login error:", err.message);

        res.status(500).json({
            error: "Login failed"
        });
    }
};

module.exports = {
    register,
    login
};
