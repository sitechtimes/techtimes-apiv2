import { Response, NextFunction, Request } from "express";
import { User } from "../models/user";

/** checks that the user's JWT is valid, and that they are verified */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log(1);
  if (!req.currentUser) return void res.sendStatus(401);
  console.log(2);
  const user = await User.findById(req.currentUser.id);
  console.log(3);
  if (!user || !user.verified) return void res.sendStatus(401);
  console.log(4);
  next();
};
