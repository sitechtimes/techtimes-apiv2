import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return next();

  try {
    const payload = jwt.verify(
      req.headers.authorization.replace("Bearer ", ""),
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (e) {
    console.error(e);
    return void res.status(401).json({ message: "you are invalid" });
  }

  next();
};
