import { Router } from "express";

import student_controller from "../../controller/student_controller";
const {
  sign_up,
  request_otp,
  verify_otp,
  forgot_password,
  update_password,
  login_student,
  get_profile,
} = student_controller;
import auth_middleware from "../../middleware/auth_middleware";

const router = Router();

// user auth routes
router.post("/auth/signup", sign_up);

router.patch("/auth/login", login_student);

router.patch("/auth/request-otp", request_otp);

router.patch("/auth/verify-otp", verify_otp);

router.patch("/auth/forgot-password", forgot_password);

router.patch("/auth/update-password", update_password);

// other routes
router.get("/profile", auth_middleware, get_profile);

export default router;
