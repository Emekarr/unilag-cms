import { Router } from "express";

import student_routes from "./student_routes";

const router = Router();

// user auth routes
router.use("/student", student_routes);

export default router;
