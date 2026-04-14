import express from "express";
import {createProject, getMe, getProjects, updateProject} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();

router.get("/auth/me", authMiddleware, getMe);
router.post("/projects", authMiddleware, createProject);
router.put("/projects", authMiddleware, updateProject);
router.get("/projects", authMiddleware, getProjects);

export default router;