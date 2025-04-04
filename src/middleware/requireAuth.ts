import { Response, NextFunction, Request } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    res.status(401).json({ message: "Unauthorized (haha)" });
    return;
  }

  next();
};
