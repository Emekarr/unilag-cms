import { Router } from "express";

import student_controller from "../../controller/student_controller";
const { sign_up, request_otp, verify_otp } = student_controller;

const router = Router();

// user auth routes
router.post("/auth/signup", sign_up);

router.patch("/auth/request-otp", request_otp);

router.patch("/auth/verify-otp", verify_otp);

export default router;
