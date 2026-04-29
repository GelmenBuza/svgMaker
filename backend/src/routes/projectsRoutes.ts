import express from "express";
import {
    createProject,
    deleteProject,
    getProjects,
    getProjectSnapshot,
    getProjectVersions,
    renameProject,
    updateProject
} from "../controllers/projectsController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();


// Проекты пользователя
router.post("/projects", authMiddleware, createProject);
router.put("/projects", authMiddleware, updateProject);
router.get("/projects", authMiddleware, getProjects);
router.get("/projects/snapshot/:projectId/:version", authMiddleware, getProjectSnapshot);
router.get("/projects/versions/:projectId", authMiddleware, getProjectVersions);
router.put("/projects/rename", authMiddleware, renameProject);
router.delete("/projects", authMiddleware, deleteProject);

export default router;
