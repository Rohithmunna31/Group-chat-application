import { Router } from "express";

import groupControllers from "../controllers/groupControllers";

import middleWare from "../util/authentication";

import { RequestHandler } from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/creategroup",
  middleWare.authentication,
  groupControllers.postGroup
);

router.post(
  "/getgroups",
  middleWare.authentication,
  groupControllers.getGroups
);

router.post(
  "/getusers/:groupid",
  middleWare.authentication,
  groupControllers.getUsers
);

router.post(
  "/upload-file/:groupid/:username",
  upload.single("file"),
  groupControllers.uploadfile
);

router.get("/joingroup/:groupid", groupControllers.getJoingroup);

router.post("/joingroup/:groupid", groupControllers.postJoingroup);

export default router;
