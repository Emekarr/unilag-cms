import { Router } from "express";
import multer from "multer";
const upload = multer();

import admin_middleware from "../../middleware/admin_middleware";
import workspace_controller from "../../controller/workspace_controller";
const { create_workspace, join_workspace, get_info } = workspace_controller;

const router = Router();

router.post("/create", admin_middleware, create_workspace);

router.patch("/join", join_workspace);

router.get("/info", get_info);

router.patch("/timtable", upload.single("timetable"), admin_middleware);

export default router;
