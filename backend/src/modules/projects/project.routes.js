import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateMember,
  updateProject,
} from "./project.controller.js";
import {
  addMemberSchema,
  createProjectSchema,
  projectIdSchema,
  removeMemberSchema,
  updateMemberSchema,
  updateProjectSchema,
} from "./project.validation.js";

export const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter
  .route("/")
  .get(asyncHandler(listProjects))
  .post(validate(createProjectSchema), asyncHandler(createProject));

projectRouter
  .route("/:projectId")
  .get(validate(projectIdSchema), asyncHandler(getProject))
  .patch(validate(updateProjectSchema), asyncHandler(updateProject))
  .delete(validate(projectIdSchema), asyncHandler(deleteProject));

projectRouter.post(
  "/:projectId/members",
  validate(addMemberSchema),
  asyncHandler(addMember),
);

projectRouter.patch(
  "/:projectId/members/:userId",
  validate(updateMemberSchema),
  asyncHandler(updateMember),
);

projectRouter.delete(
  "/:projectId/members/:userId",
  validate(removeMemberSchema),
  asyncHandler(removeMember),
);
