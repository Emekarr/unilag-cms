import { Router } from "express";

import admin_middleware from "../../middleware/admin_middleware";
import workspace_controller from "../../controller/workspace_controller";
const { create_workspace, join_workspace, get_info } = workspace_controller;

const router = Router();

router.post("/create", admin_middleware, create_workspace);

router.patch("/join", join_workspace);

router.get("/info", get_info);

export default router;
