import { Router } from "express";

import admin_middleware from "../../middleware/admin_middleware";
import workspace_controller from "../../controller/workspace_controller";
const { create_workspace } = workspace_controller;

const router = Router();

router.post("/create", admin_middleware, create_workspace);

export default router;
