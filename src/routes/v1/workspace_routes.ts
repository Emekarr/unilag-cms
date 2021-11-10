import { Router } from "express";
import multer_setup from "../../utils/multer_setup";

import admin_middleware from "../../middleware/admin_middleware";
import workspace_controller from "../../controller/workspace_controller";
import class_rep_middleware from "../../middleware/class_rep_middleware";
import auth_middleware from "../../middleware/auth_middleware";
const {
  create_workspace,
  join_workspace,
  get_info,
  get_members_count,
  set_timetable,
  add_admin,
} = workspace_controller;

const router = Router();

router.post("/create", auth_middleware, class_rep_middleware, create_workspace);

router.patch("/join", join_workspace);

router.get("/info", get_info);

router.get("/count", get_members_count);

router.patch(
  "/timetable",
  auth_middleware,
  admin_middleware,
  multer_setup.single("timetable"),
  set_timetable
);

router.patch("/add-admin", class_rep_middleware, add_admin);

export default router;
