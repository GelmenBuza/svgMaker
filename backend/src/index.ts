import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

type User = {
  id: number;
  email: string;
  passwordHash: string;
};

type AuthenticatedRequest = Request & {
  user?: {
    userId: number;
    email: string;
  };
};

const app = express();
const port = Number(process.env.PORT) || 4000;
const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const users: User[] = [];
let nextUserId = 1;

app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const createToken = (payload: { userId: number; email: string }): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
};

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload & {
      userId: number;
      email: string;
    };
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ message: "Невалидный токен" });
  }
};

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "backend", timestamp: new Date().toISOString() });
});

app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "email и password обязательны" });
    return;
  }

  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(409).json({ message: "Пользователь уже существует" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const createdUser: User = { id: nextUserId++, email, passwordHash };
  users.push(createdUser);

  const token = createToken({ userId: createdUser.id, email: createdUser.email });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({ id: createdUser.id, email: createdUser.email });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "email и password обязательны" });
    return;
  }

  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(401).json({ message: "Неверные email или password" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ message: "Неверные email или password" });
    return;
  }

  const token = createToken({ userId: user.id, email: user.email });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ id: user.id, email: user.email });
});

app.get("/auth/me", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.post("/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
