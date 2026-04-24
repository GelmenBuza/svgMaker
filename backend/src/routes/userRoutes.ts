import express from "express";
import {
    createProject,
    getMe,
    getProjects,
    updateProject,
    getProjectSnapshot,
    renameProject,
    deleteProject,
    changeUsername,
    changeEmail,
    changePassword,
    deleteAccount,
    getProjectVersions
} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();


// Пользователь
router.get("/auth/me", authMiddleware, getMe);
router.put("/user/change-username", authMiddleware, changeUsername);
router.put("/user/change-email", authMiddleware, changeEmail);
router.put("/user/change-password", authMiddleware, changePassword);
router.delete("/user/delete-account", authMiddleware, deleteAccount);

// Проекты пользователя
router.post("/projects", authMiddleware, createProject);
router.put("/projects", authMiddleware, updateProject);
router.get("/projects", authMiddleware, getProjects);
router.get("/projects/snapshot/:projectId/:version", authMiddleware, getProjectSnapshot);
router.get("/projects/versions/:projectId", authMiddleware, getProjectVersions);
router.put("/projects/rename", authMiddleware, renameProject);
router.delete("/projects", authMiddleware, deleteProject);

export default router;  