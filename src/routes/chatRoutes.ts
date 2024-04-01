import { Router } from "express";

import chatControllers from "../controllers/chatControllers";

import middleWare from "../util/authentication";

const router = Router();

router.get("/chat/:groupid", chatControllers.getUserChat);

router.post(
  "/chat/:groupid",
  middleWare.authentication,
  chatControllers.postUserchats
);

router.post(
  "/chats/:messageid",
  middleWare.authentication,
  chatControllers.postGroupchats
);

export default router;
