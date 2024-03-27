import { Router } from "express";

import userController from "../controllers/userControllers";

const router = Router();

router.get("/signup", userController.getUsersignup);

router.post("/signup", userController.postUsersignup);

router.get("/login", userController.getUserlogin);

router.post("/login", userController.postUserlogin);

export default router;
