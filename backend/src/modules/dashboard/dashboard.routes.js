import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getDashboard } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, asyncHandler(getDashboard));

