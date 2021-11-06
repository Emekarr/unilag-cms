import { Router } from "express";
import multer_setup from "../../utils/multer_setup";

import student_controller from "../../controller/student_controller";
import admin_middleware from "../../middleware/admin_middleware";
const {
  sign_up,
  request_otp,
  verify_otp,
  forgot_password,
  update_password,
  login_student,
  get_profile,
  update_profile_image,
} = student_controller;
import auth_middleware from "../../middleware/auth_middleware";

const router = Router();

// user auth routes
router.post("/auth/signup", sign_up);

router.post("/auth/login", login_student);

router.post("/auth/request-otp", request_otp);

router.patch("/auth/verify-otp", verify_otp);

router.post("/auth/forgot-password", forgot_password);

router.patch("/auth/update-password", update_password);

// other routes
router.get("/profile", auth_middleware, get_profile);

router.patch(
  "/profile_image",
  auth_middleware,
  multer_setup.single("profile-image"),
  update_profile_image
);

export default router;
