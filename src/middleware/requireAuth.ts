import { Response, NextFunction, Request } from "express";
import { User } from "../models/user";

/** checks that the user's JWT is valid, and that they are verified */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) return void res.sendStatus(401);

  const user = await User.findById(req.currentUser.id);
  if (!user || !user.verified) return void res.sendStatus(401);

  next();
};
