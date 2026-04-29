import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {type Request, type Response} from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import {prisma} from "./prismaClient";
import {registerChatHandlers} from "./soket/chatSoket";
import {verifyToken} from "./utils/jwt.utils";

const app = express();
const port = Number(process.env.PORT) || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
    cors({
        origin: clientOrigin,
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
    res.json({ok: true, service: "backend", timestamp: new Date().toISOString()});
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: clientOrigin,
        credentials: true,
    },
});

io.engine.use(cookieParser());

io.use(async (socket, next) => {
    console.log(socket.handshake);
    const cookies = socket.request.cookies;
    if (!cookies) {
        return next(new Error(`Cookie not found`));
    }
    console.log(cookies)

    if (!cookies.accessToken) {
        return next(new Error("Not authorized"));
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
})

registerChatHandlers(io);

httpServer.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log("Server shutdown");
    process.exit(0);
});