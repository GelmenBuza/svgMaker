import { Request, Response } from "express";
import 'http';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

declare module 'http' {
    interface IncomingMessage {
        cookies?: { [key: string]: string };
    }
}