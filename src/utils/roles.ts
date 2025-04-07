import { Response, NextFunction, Request } from "express";
import { Role } from "../models/role";

/**
 * @param roles an array of Roles
 *
 * proceed if the user has any of the roles in the provided parameter, commonly used for checking admin
 *
 * sends 401 unauthorized otherwise
 */
export const roles = (roles: Array<Role>) => (req: Request, res: Response, next: NextFunction) => {
  const authorized = roles.some((role) => req.currentUser!.role === role);

  if (!authorized) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
};
