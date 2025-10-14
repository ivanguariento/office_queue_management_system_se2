import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error(
    "Missing required env: DATABASE_URL. Copy .env.example in a new .env and set the values."
  );
  process.exit(1);
}

const APP_V1_BASE_URL = "/api/v1";

export const CONFIG = {
  APP_HOST: process.env.HOST || "localhost",
  APP_PORT: process.env.PORT || 3000,

  // DB_TYPE: process.env.DB_TYPE || undefined,
  // DB_HOST: process.env.DB_HOST || undefined,
  // DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  // DB_USERNAME: process.env.DB_USERNAME || undefined,
  // DB_PASSWORD: process.env.DB_PASSWORD || undefined,
  // DB_NAME: process.env.DB_NAME || undefined,

  ROUTES: {
    TICKETS: APP_V1_BASE_URL + "/tickets",
    SERVICES: APP_V1_BASE_URL + "/services",
  },
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_PATH: process.env.LOG_PATH || "logs",
  ERROR_LOG_FILE: process.env.ERROR_LOG_FILE || "error.log",
  COMBINED_LOG_FILE: process.env.COMBINED_LOG_FILE || "combined.log",
};
