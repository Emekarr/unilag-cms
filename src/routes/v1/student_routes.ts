import { Router } from "express";

import student_controller from "../../controller/student_controller";
const { sign_up, request_otp } = student_controller;

const router = Router();

// user auth routes
router.post("/auth/signup", sign_up);

router.put("/auth/request-otp", request_otp);

export default router;
