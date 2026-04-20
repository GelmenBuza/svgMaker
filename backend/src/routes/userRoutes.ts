import express from "express";
import {createProject, getMe, getProjects, updateProject, getProjectSnapshot, renameProject, deleteProject} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();

router.get("/auth/me", authMiddleware, getMe);
router.post("/projects", authMiddleware, createProject);
router.put("/projects", authMiddleware, updateProject);
router.get("/projects", authMiddleware, getProjects);
router.get("/projects/snapshot/:projectId/:version", authMiddleware, getProjectSnapshot);
router.put("/projects/rename", authMiddleware, renameProject);
router.delete("/projects", authMiddleware, deleteProject);  

export default router;