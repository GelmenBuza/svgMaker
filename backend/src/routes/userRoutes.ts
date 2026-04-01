import express from "express";
import {getMe} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();

router.get("/auth/me", authMiddleware, getMe);
