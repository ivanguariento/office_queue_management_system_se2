import { Error, createErrorDTO } from "@models/Error";
import { AppError } from "@errors/AppError";
import { logError } from "@services/loggingService";

export function createAppError(err: any): Error {
  let modelError: Error = createErrorDTO(
    500,
    err?.message || "Internal Server Error",
    "InternalServerError"
  );

  logError(err);
  logError(
    `Error: ${err?.message}\nStacktrace:\n${
      err?.stack || "No stacktrace available"
    }`
  );

  if (
    err instanceof AppError ||
    (err.status && typeof err.status === "number")
  ) {
    modelError = createErrorDTO(err.status, err.message, err.name);
  }

  return modelError;
}
