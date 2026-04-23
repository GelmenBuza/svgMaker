import type { Request, Response } from "express";
import { prisma } from "../prismaClient";
import bcrypt from "bcrypt";


const getMe = (req: Request, res: Response) => {
    res.json({ user: req.userId });
}
// Пользователь
const changeUsername = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { username } = req.body as { username?: string };
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { username },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error in changeUsername:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const changeEmail = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { email } = req.body as { email?: string };
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true
            }
        });
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error in changeEmail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { currentPassword, newPassword } = req.body as { currentPassword?: string, newPassword?: string };
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Password is required" });
        }
        const user = await prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const deletedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                email: "DELETED",
                username: "DELETED",
                password: "DELETED",
                refresh_token: null,
                deletedAt: new Date()
            },
            select: { id: true },
        });
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error in deleteAccount:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
// Проекты пользователя
const getProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                lastVersion: true,
                updatedAt: true,
            },
        });

        res.json({ projects });
    } catch (error) {
        console.error("Error in getProjects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getProjectSnapshot = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { projectId, version } = req.params as { projectId?: number, version?: number };
        if (!projectId || !version) {
            return res.status(400).json({ error: "project Id and version are required" });
        }
        const normalizedProjectId = Number(projectId);
        if (isNaN(normalizedProjectId)) {
            return res.status(400).json({ error: "Project id is not a number" });
        }
        const normalizedVersion = Number(version);
        if (isNaN(normalizedVersion)) {
            return res.status(400).json({ error: "Version is not a number" });
        }
        const projectSnapshot = await prisma.projectVersion.findFirst({
            where: { projectId: normalizedProjectId, version: normalizedVersion },
            select: { snapshot: true },
        });
        if (!projectSnapshot) {
            return res.status(404).json({ error: "Project snapshot not found" });
        }
        res.json({ snapshot: projectSnapshot.snapshot });
    } catch (error) {
        console.error("Error in getProjectSnapshot:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
const createProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { name } = req.body as { name?: string };
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const newProject = await prisma.project.create({
            data: { userId, name },
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
        });

        res.status(201).json({ project: newProject });
    } catch (error) {
        console.error("Error in createProject:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const renameProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id, name } = req.body as { id?: number, name?: string };
        if (!id || !name) {
            return res.status(400).json({ error: "Id and name are required" });
        }
        const normalizedId = Number(id);
        if (isNaN(normalizedId)) {
            return res.status(400).json({ error: "Id is not a number" });
        }
        const normalizedName = name.trim();
        if (normalizedName.length === 0) {
            return res.status(400).json({ error: "Name is required" });
        }
        const currentProject = await prisma.project.findFirst({
            where: { id: normalizedId, userId },
            select: { id: true, name: true },
        });
        if (!currentProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        const updatedProject = await prisma.project.update({
            where: { id: normalizedId },
            data: { name: normalizedName },
            select: { id: true, name: true },
        });
        res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error("Error in renameProject:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const updateProject = async (req: Request, res: Response) => {
    try {
        // Проверяем, что запрос пришел от авторизованного пользователя.
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id, name, snapshot } = req.body as { id?: number, name?: string, snapshot?: object };
        // Валидируем обязательные поля для обновления проекта.
        if (!id || !name || !snapshot) {
            return res.status(400).json({ error: "Id, name and snapshot are required" });
        }

        // Проверяем, что проект существует и принадлежит текущему пользователю.
        const currentProject = await prisma.project.findFirst({
            where: { id, userId },
            select: { id: true, lastVersion: true },
        });

        if (!currentProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Увеличиваем номер версии и сохраняем новый snapshot как отдельную версию.
        const nextVersion = currentProject.lastVersion + 1;
        const [, updatedProject] = await prisma.$transaction([
            prisma.projectVersion.create({
                data: { projectId: id, version: nextVersion, snapshot },
            }),
            prisma.project.update({
                where: { id },
                data: { name, lastVersion: nextVersion },
            }),
        ]);

        // Возвращаем обновленный проект с актуальным номером версии.
        res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error("Error in updateProject:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id } = req.body as { id?: number };
        if (!id) {
            return res.status(400).json({ error: "Id is required" });
        }
        const normalizedId = Number(id);
        if (isNaN(normalizedId)) {
            return res.status(400).json({ error: "Id is not a number" });
        }
        const currentProject = await prisma.project.findFirst({
            where: { id: normalizedId, userId },
            select: { id: true, name: true },
        });
        if (!currentProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        await prisma.$transaction([
            prisma.projectVersion.deleteMany({
                where: { projectId: normalizedId },
            }),
            prisma.project.delete({
                where: { id: normalizedId },
            }),
        ]);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProject:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export { getMe, changeUsername, changeEmail, changePassword, deleteAccount, getProjects, getProjectSnapshot, createProject, renameProject, updateProject, deleteProject };