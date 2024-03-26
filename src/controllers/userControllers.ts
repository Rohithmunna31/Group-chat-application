import path from "path";

import users from "../models/user";

import bcrpyt from "bcrypt";

import { Request, Response } from "express";

const user: any = {};

user.getUsersignup = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/signup.html"));
};

user.postUsersignup = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const find = await users.findOne({ where: { email: req.body.email } });

    if (find) {
      console.log("hello");
      return res
        .status(400)
        .json({ success: false, message: "User already exists try loggin" });
    }

    const hashedPassword = await bcrpyt.hash(req.body.password, 10);

    const createUser = await users.create({
      username: req.body.username,
      email: req.body.email,
      mobileno: req.body.mobileno,
      password: hashedPassword,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({ success: false, message: "signup failed" });
  }
  res.status(200).json({ success: true, message: "signup successfull" });
};

export default user;
