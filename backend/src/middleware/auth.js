import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication token is required");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}

