import { Router } from "express";
import multer_setup from "../../utils/multer_setup";

import admin_middleware from "../../middleware/admin_middleware";
import workspace_controller from "../../controller/workspace_controller";
import class_rep_middleware from "../../middleware/class_rep_middleware";
const {
  create_workspace,
  join_workspace,
  get_info,
  get_members_count,
  set_timetable,
} = workspace_controller;

const router = Router();

router.post("/create", class_rep_middleware, create_workspace);

router.patch("/join", join_workspace);

router.get("/info", get_info);

router.get("/count", get_members_count);

router.patch(
  "/timetable",
  admin_middleware,
  multer_setup.single("timetable"),
  set_timetable
);

export default router;
