import type {Request, Response} from "express";
import {prisma} from "../prismaClient";
import bcrypt from "bcrypt";


// Пользователь
const changeUsername = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const {username} = req.body as { username?: string };
        if (!username) {
            return res.status(400).json({error: "Username is required"});
        }
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {username},
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(200).json({user: updatedUser});
    } catch (error) {
        console.error("Error in changeUsername:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const changeEmail = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const {email} = req.body as { email?: string };
        if (!email) {
            return res.status(400).json({error: "Email is required"});
        }
        const existingUser = await prisma.user.findFirst({
            where: {email},
        });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({error: "Email already exists"});
        }
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {email},
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true
            }
        });
        res.status(200).json({user: updatedUser});
    } catch (error) {
        console.error("Error in changeEmail:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const {currentPassword, newPassword} = req.body as { currentPassword?: string, newPassword?: string };
        if (!currentPassword || !newPassword) {
            return res.status(400).json({error: "Password is required"});
        }
        const user = await prisma.user.findFirst({
            where: {id: userId},
        });
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({error: "Invalid current password"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {password: hashedPassword},
        });
        res.status(200).json({message: "Password changed successfully"});
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const deletedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                email: "DELETED",
                username: "DELETED",
                password: "DELETED",
                refresh_token: null,
                deletedAt: new Date()
            },
            select: {id: true},
        });
        if (!deletedUser) {
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json({message: "Account deleted successfully"});
    } catch (error) {
        console.error("Error in deleteAccount:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export {
    changeUsername,
    changeEmail,
    changePassword,
    deleteAccount,
};