import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {prisma} from "../prismaClient";
import {createAccessToken, createRefreshToken, verifyToken} from "../utils/jwt.utils";
import cookieParser from "cookie-parser";


const register = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body as { email?: string; password?: string };
        if (!email || !password) {
            res.status(400).json({message: "email и password обязательны"});
            return;
        }

        const existingUser = await prisma.user.findFirst({
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
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        // const accessToken = createAccessToken({userId: newUser.id});
        // const refreshToken = createRefreshToken({userId: newUser.id});

        const updatedUser = await prisma.user.update({
            where: {id: newUser.id},
            data: {
                username: `user-${newUser.id}`,
                // refresh_token: refreshToken,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
        // res.cookie("accessToken", accessToken, {
        //     httpOnly: true,
        //     sameSite: "lax",
        //     secure: false,
        //     maxAge: 15 * 60 * 1000
        // });
        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     sameSite: "lax",
        //     secure: false,
        //     path: "/api/auth/refresh-token",
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });

        res.status(201).json({message: "User successfully created", user: updatedUser, error: null});
    } catch (error) {
        const {email} = req.body as { email?: string };

        const errorUser = await prisma.user.findFirst({
            where: {email},
            select: {
                id: true,
            }
        })
        if (errorUser) {
            await prisma.user.delete({
                where: {id: errorUser.id}
            })
        }
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

        const userPassword = await prisma.user.findFirst({
            where: {email},
            select: {
                password: true,
            }
        });

        if (!userPassword) {
            res.status(401).json({message: "Неверные email или password"});
            return;
        }

        const isValidPassword = await bcrypt.compare(password, userPassword.password);
        if (!isValidPassword) {
            res.status(401).json({message: "Неверные email или password"});
            return;
        }

        const user = await prisma.user.findFirst({
            where: {email},
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            }
        }) as User;

        const accessToken = createAccessToken({userId: user.id});
        let refreshToken = req.cookies.refreshToken || "";
        console.log("req:", req);
        console.log("cookies:", req.cookies);
        console.log('refreshToken: ', refreshToken);

        if (refreshToken) {
            const decoded = verifyToken(refreshToken);

            const session = await prisma.sessions.findUnique({
                where: {id: decoded.sessionId},

                select: {
                    isActive: true,
                },
            });
            if (!session.isActive) {
                res.status(403).json({message: 'Forbidden'})
                return;
            } else {
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: false,
                    maxAge: 15 * 60 * 1000
                })
                res.json({message: "User successfully logged in", user, error: null})
                return;
            }
        }

        const session = await prisma.sessions.create({
            data: {isActive: true},
            select: {
                id: true,
            }
        })

        refreshToken = createRefreshToken({userId: user.id, sessionId: session.id});

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
            // path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({message: "User successfully logged in", user, error: null});
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const decoded = verifyToken(refreshToken);

        await prisma.sessions.update({
            where: {id: decoded.sessionId},
            data: {isActive: false},
        })

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
    } catch (error) {
        console.error("Error in refresh token:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const getMe = (req: Request, res: Response) => {
    res.json({user: req.userId});
}

export {register, login, logout, refreshToken, getMe};