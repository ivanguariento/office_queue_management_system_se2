import { Error, ErrorToJSON } from "@models/Error";
import { createAppError } from "@services/errorService";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let modelError: Error = createAppError(err);
  res.status(modelError.code).json(ErrorToJSON(modelError));
}
