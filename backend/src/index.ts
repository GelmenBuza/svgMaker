import cookieParser from "cookie-parser";
import cors from "cors";
import express, {type Request, type Response} from "express";


const app = express();
const port = Number(process.env.PORT) || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
    cors({
        origin: clientOrigin,
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
    res.json({ok: true, service: "backend", timestamp: new Date().toISOString()});
});

app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});
