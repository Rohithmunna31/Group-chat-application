import path from "path";

import messages from "../models/messages";

import { Request, Response } from "express";

import dotenv from "dotenv";

import jwt from "jsonwebtoken";

dotenv.config();

const chats: any = {};

chats.getUserChat = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/chatapp.html"));
};

chats.postUserchats = async (req: Request, res: Response) => {
  try {
    const message = req.body.message;

    const createMessage = await messages.create({
      message: message,
      UserId: req.user.id,
    });

    return res
      .status(200)
      .json({ success: true, message: message, username: req.user.username });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot send message" });
  }
};

export default chats;
