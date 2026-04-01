import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {prisma} from "../prismaClient";
import {createToken} from "../utils/jwt.utils";

const jwtSecret = process.env.JWT_SECRET as string;


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

        const user = await prisma.user.create({
            data: {
                email,
                username: "user",
                role: "user",
                password: passwordHash,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(201).json({message: "User successfully created", user});
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({message: "Internal server error"});
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

        const token = createToken({userId: user.id}, jwtSecret);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({id: user.id, email: user.email});
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        res.status(204).send();
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({message: "Internal server error"});
    }
}


export {register, login, logout};