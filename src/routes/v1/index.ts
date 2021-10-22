import { Router } from "express";

import student_routes from "./student_routes";

const router = Router();

// user auth routes
router.post("/student", student_routes);

export default router;
