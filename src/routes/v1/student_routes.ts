import { Router } from "express";

import student_controller from "../../controller/student_controller";
const { sign_up, request_otp, verify_otp, forgot_password, update_password } =
  student_controller;

const router = Router();

// user auth routes
router.post("/auth/signup", sign_up);

router.patch("/auth/request-otp", request_otp);

router.patch("/auth/verify-otp", verify_otp);

router.patch("/auth/forgot-password", forgot_password);

router.patch("/auth/update-password", update_password);


export default router;
