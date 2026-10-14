const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

router.get("/", authenticateToken, getStudents);
router.post("/", authenticateToken, addStudent);
router.put("/:id", authenticateToken, updateStudent);
router.delete("/:id", authenticateToken, deleteStudent);

module.exports = router;