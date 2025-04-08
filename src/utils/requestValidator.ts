import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/** handles potential validation errors (to be used with express-validator) */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) throw new Error(JSON.stringify(errors.array()));

  next();
};
