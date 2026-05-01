import express from "express";
import {register, login, logout, refreshToken} from "../controllers/authController";
import {getMe} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();


router.get("/me", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;