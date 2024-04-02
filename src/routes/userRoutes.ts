import { Router } from "express";

import userController from "../controllers/userControllers";

import middleWare from "../util/authentication";

const router = Router();

router.get("/signup", userController.getUsersignup);

router.post("/signup", userController.postUsersignup);

router.get("/login", userController.getUserlogin);

router.post("/login", userController.postUserlogin);

router.get("/home", userController.getUserhome);

router.get("/removeuser/:groupid/:userid", userController.removeUser);

router.get("/makeadmin/:groupid/:userid", userController.makeAdmin);

router.post("/searchusers", userController.searchUsers);

router.post("/adduser/:groupid", userController.addUser);

export default router;
