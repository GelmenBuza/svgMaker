import jwt from "jsonwebtoken";

export const createToken = (payload: { userId: number }, jwtSecret : string): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
};