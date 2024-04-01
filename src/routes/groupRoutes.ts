import { Router } from "express";

import groupControllers from "../controllers/groupControllers";

import middleWare from "../util/authentication";

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

router.get("/joingroup/:groupid", groupControllers.getJoingroup);

router.post("/joingroup/:groupid", groupControllers.postJoingroup);

export default router;
