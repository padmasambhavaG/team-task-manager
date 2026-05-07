import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredInProduction) {
  if (process.env.NODE_ENV === "production" && !process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5001),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "local-dev-secret-change-me",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

