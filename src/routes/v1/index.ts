import { Router } from "express";

import student_routes from "./student_routes";
import workspace_routes from "./workspace_routes";
import channel_routes from "./channel_routes";

import auth_middleware from "../../middleware/auth_middleware";

const router = Router();

// student auth routes
router.use("/student", student_routes);

router.use("/workspace", auth_middleware, workspace_routes);

router.use("/channel", auth_middleware, channel_routes);

export default router;
