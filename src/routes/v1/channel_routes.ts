import { Router } from "express";

import channel_controller from "../../controller/channel_controller";
const { create_channel, channel_details, join_channel, get_all_user_channels } =
  channel_controller;
import class_rep_middleware from "../../middleware/class_rep_middleware";

const router = Router();

router.post("/create", class_rep_middleware, create_channel);

router.get("/info", channel_details);

router.patch("/join", join_channel);

router.get("/personal", get_all_user_channels);

export default router;
