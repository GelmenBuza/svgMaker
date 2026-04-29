import {verifyToken} from "../utils/jwt.utils";
import {prisma} from "../prismaClient";
import {ExtendedError, Socket} from "socket.io";


type MiddlewareNext = (err?: ExtendedError) => void;

export default async function SocketMiddleware(socket: Socket, next: MiddlewareNext) {
    try {
        const cookies = socket.request.cookies;
        if (!cookies) {
            return next(new Error(`Cookie not found`));
        }

        const AccessToken = cookies.accessToken;
        if (!AccessToken) {
            return next(new Error("Authentication required"));
        }

        const decoded = verifyToken(AccessToken);
        const userId = decoded.userId;


        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {id: true},
        });

        if (!user) {
            return next(new Error("User not found"));
        }
        next();
    } catch (e) {
        console.error(`socket Middleware Error: ${e}`);
    }
}