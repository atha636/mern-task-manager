const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createTask,
    getTasks,
    updateTask,
    updateTaskStatus,
    deleteTask
} = require("../controllers/taskController");

router.post("/", protect, createTask);

router.get("/", protect, getTasks);

router.put("/:id", protect, updateTask);

router.patch("/:id/status", protect, updateTaskStatus);
router.delete("/:id", protect, deleteTask);

module.exports = router;