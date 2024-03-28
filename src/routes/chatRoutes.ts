import { Router } from "express";

import chatControllers from "../controllers/chatControllers";

import middleWare from "../util/authentication";

const router = Router();

router.get("/chat", chatControllers.getUserChat);

router.post("/chat", middleWare.authentication, chatControllers.postUserchats);

export default router;