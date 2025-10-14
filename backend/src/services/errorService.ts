import { ErrorDTO } from "../dto/ErrorDTO";
import { AppError } from "../errors/AppError";
import { createErrorDTO } from "../dto/ErrorDTO";

export function createAppError(err: any): ErrorDTO {
  let modelError: ErrorDTO = createErrorDTO(
    500,
    err?.message || "Internal Server Error",
    "InternalServerError"
  );

  if (
    err instanceof AppError ||
    (err.status && typeof err.status === "number")
  ) {
    modelError = createErrorDTO(err.status, err.message, err.name);
  }

  return modelError;
}


