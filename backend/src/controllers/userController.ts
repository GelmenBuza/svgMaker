import type {Request, Response} from "express";
import { prisma } from "../prismaClient";


const getMe = (req: Request, res: Response) => {
    res.json({ user: req.userId });
}

const getProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const projects = await prisma.project.findMany({
            where: {userId},
            orderBy: {updatedAt: "desc"},
            select: {
                id: true,
                name: true,
                lastVersion: true,
                updatedAt: true,
            },
        });

        res.json({projects});
    } catch (error) {
        console.error("Error in getProjects:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const getProjectSnapshot = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const {projectId, version} = req.params as {projectId?: number, version?: number};
        if (!projectId || !version) {
            return res.status(400).json({error: "project Id and version are required"});
        }
        const normalizedProjectId = Number(projectId);
        if (isNaN(normalizedProjectId)) {
            return res.status(400).json({error: "Project id is not a number"});
        }
        const normalizedVersion = Number(version);
        if (isNaN(normalizedVersion)) {
            return res.status(400).json({error: "Version is not a number"});
        }
        const projectSnapshot = await prisma.projectVersion.findFirst({
            where: {projectId: normalizedProjectId, version: normalizedVersion},
            select: {snapshot: true},
        });
        if (!projectSnapshot) {
            return res.status(404).json({error: "Project snapshot not found"});
        }
        res.json({snapshot: projectSnapshot.snapshot});
    } catch (error) {
        console.error("Error in getProjectSnapshot:", error);
        res.status(500).json({error: "Internal server error"});
    }
}
const createProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const {name} = req.body as {name?: string};
        if (!name) {
            return res.status(400).json({error: "Name is required"});
        }

        const newProject = await prisma.project.create({
            data: {userId, name},
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
        });

        res.status(201).json({project: newProject});
    } catch (error) {
        console.error("Error in createProject:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const updateProject = async (req: Request, res: Response) => {
    try {
        // Проверяем, что запрос пришел от авторизованного пользователя.
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const {id, name, snapshot} = req.body as {id?: number, name?: string, snapshot?: object};
        // Валидируем обязательные поля для обновления проекта.
        if (!id || !name || !snapshot) {
            return res.status(400).json({error: "Id, name and snapshot are required"});
        }

        // Проверяем, что проект существует и принадлежит текущему пользователю.
        const currentProject = await prisma.project.findFirst({
            where: {id, userId},
            select: {id: true, lastVersion: true},
        });

        if (!currentProject) {
            return res.status(404).json({error: "Project not found"});
        }

        // Увеличиваем номер версии и сохраняем новый snapshot как отдельную версию.
        const nextVersion = currentProject.lastVersion + 1;
        const [, updatedProject] = await prisma.$transaction([
            prisma.projectVersion.create({
                data: {projectId: id, version: nextVersion, snapshot},
            }),
            prisma.project.update({
                where: {id},
                data: {name, lastVersion: nextVersion},
            }),
        ]);

        // Возвращаем обновленный проект с актуальным номером версии.
        res.status(200).json({project: updatedProject});
    } catch (error) {
        console.error("Error in updateProject:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export {getMe, getProjects, createProject, updateProject, getProjectSnapshot};