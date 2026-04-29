import express from "express";
import {
    changeUsername,
    changeEmail,
    changePassword,
    deleteAccount,
} from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";


const router = express.Router();


// Пользователь
router.put("/user/change-username", authMiddleware, changeUsername);
router.put("/user/change-email", authMiddleware, changeEmail);
router.put("/user/change-password", authMiddleware, changePassword);
router.delete("/user/delete-account", authMiddleware, deleteAccount);


export default router;  