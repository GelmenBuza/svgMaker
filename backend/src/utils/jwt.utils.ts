import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET as string;


export const createAccessToken = (payload: { userId: number }): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn: "15m" });
};

export const createRefreshToken = (payload: { userId: number }): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, jwtSecret) as JwtPayload;
};