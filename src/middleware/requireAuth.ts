import { Response, NextFunction, Request } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) return void res.status(401).json({ message: "Unauthorized" });

  next();
};
