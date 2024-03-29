import path from "path";

import messages from "../models/messages";

import users from "../models/user";

import { Request, Response } from "express";

import dotenv from "dotenv";

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

chats.postGroupchats = async (req: Request, res: Response) => {
  try {
    const allMessages = await messages.findAll({
      include: {
        model: users,
        attributes: ["username"],
      },
    });

    const filteredMessages = allMessages.map((message) => {
      if (message.dataValues.User.dataValues.username == req.user.username) {
        message.dataValues.User.dataValues.username = "you";
      }
      return message;
    });

    return res.status(200).json({ success: true, allMessages: allMessages });
  } catch (err) {
    console.log(err);

    console.log("in get group chats error");
    return res.status(400).json({ success: false });
  }
};

export default chats;
