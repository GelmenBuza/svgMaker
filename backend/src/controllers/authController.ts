import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {prisma} from "../prismaClient";
import {createAccessToken, createRefreshToken, verifyToken} from "../utils/jwt.utils";
import { error } from "node:console";


const register = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body as { email?: string; password?: string };
        if (!email || !password) {
            res.status(400).json({message: "email и password обязательны"});
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: {email},
        })

        if (existingUser) {
            res.status(409).json({message: "Пользователь уже существует"});
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                username: "user",
                role: "user",
                password: passwordHash,
            },
            select: {
                id: true,
            },
        });

        const accessToken = createAccessToken({userId: newUser.id});
        const refreshToken = createRefreshToken({userId: newUser.id});

        const updatedUser = await prisma.user.update({
            where: {id: newUser.id},
            data: {
                username: `user-${newUser.id}`,
                refresh_token: refreshToken,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 15 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/api/auth/refresh-token",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({message: "User successfully created", user: updatedUser, error: null});
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({message: "Internal server error", error: (error as Error).message});
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body as { email?: string; password?: string };

        if (!email || !password) {
            res.status(400).json({message: "email и password обязательны"});
            return;
        }

        const user = await prisma.user.findUnique({
            where: {email},
        });

        if (!user) {
            res.status(401).json({message: "Неверные email или password"});
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({message: "Неверные email или password"});
            return;
        }

        const accessToken = createAccessToken({userId: user.id});
        const refreshToken = createRefreshToken({userId: user.id});

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 15 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const updatedUser = await prisma.user.update({
            where: {id: user.id},
            data: {
                refresh_token: refreshToken,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });

        res.json({message: "User successfully logged in", user: updatedUser, error: null});
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        prisma.user.update({
            where: {id: req.userId},
            data: {refresh_token: null},
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({message: "No refresh token"});
            return;
        }
        const decoded = verifyToken(refreshToken);
        const user = await prisma.user.findUnique({
            where: {id: decoded.userId},
        });
        if (!user) {
            res.status(401).json({message: "User not found"});
            return;
        }
        const accessToken = createAccessToken({userId: user.id});
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 15 * 60 * 1000
        });
        res.status(200).json({message: "Token refreshed"});
    }
    catch (error) {
        console.error("Error in refresh token:", error);
        res.status(500).json({message: "Internal server error"});
    }
}


export {register, login, logout, refreshToken};