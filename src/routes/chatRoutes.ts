import { Router } from "express";

import chatControllers from "../controllers/chatControllers";

import middleWare from "../util/authentication";

const router = Router();

router.get("/chat/:groupid/:groupname/:username", chatControllers.getUserChat);

router.post(
  "/chat/:groupid/:groupname/",
  middleWare.authentication,
  chatControllers.postUserchats
);

router.post(
  "/chats/:messageid/:groupid",
  middleWare.authentication,
  chatControllers.postGroupchats
);

export default router;
