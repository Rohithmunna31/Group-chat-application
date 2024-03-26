import { Router } from "express";

import signupController from "../controllers/userControllers";

const router = Router();

router.get("/signup", signupController.getUsersignup);

router.post("/signup", signupController.postUsersignup);

export default router;
