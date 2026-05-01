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
router.post("/createProject", authMiddleware, createProject);
router.put("/updateProject", authMiddleware, updateProject);
router.get("/getProjects", authMiddleware, getProjects);
router.get("/snapshot/:projectId/:version", authMiddleware, getProjectSnapshot);
router.get("/versions/:projectId", authMiddleware, getProjectVersions);
router.put("/rename", authMiddleware, renameProject);
router.delete("/deleteProject", authMiddleware, deleteProject);

export default router;
