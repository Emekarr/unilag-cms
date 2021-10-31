import { Router } from "express";

import channel_controller from "../../controller/channel_controller";
const { create_channel } = channel_controller;
import admin_middleware from "../../middleware/admin_middleware";

const router = Router();

router.post("/create", admin_middleware, create_channel);

export default router;
