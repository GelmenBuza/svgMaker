import {Request, Response, NextFunction} from "express";

import jwt, {JwtPayload} from "jsonwebtoken";
import {prisma} from "../prismaClient";

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({error: "Not authorized"});
        }
        const AccessToken = req.headers.authorization.split(" ")[1];
        if (!AccessToken) {
            return res.status(401).json({error: "Authentication required"});
        }

        const jwtSecret = process.env.JWT_SECRET as string;

        const decoded = jwt.verify(AccessToken, jwtSecret) as JwtPayload;
        req.userId = decoded.userId;


        const user = await prisma.user.findUnique({
            where: {id: req.userId},
            select: {id: true},
        });

        if (!user) {
            return res.status(401).json({error: "User not found"});
        }
        next();
    } catch (err) {
        if (err instanceof Error) {

            if (err.name === "JsonWebTokenError") {
                return res.status(401).json({error: "Invalid Token"});
            }
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({error: "Token Expired"});
            }
            console.error("Auth middleware error:", err);
            res.status(500).json({error: "internal server error"});
        }
    }
};

export default authMiddleware;
