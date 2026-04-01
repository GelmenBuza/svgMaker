import type {Request, Response} from "express";


const getMe = (req: Request, res: Response) => {
    res.json({ user: req.userId });
}

export {getMe};