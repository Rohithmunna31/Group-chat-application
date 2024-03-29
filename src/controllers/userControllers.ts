import path from "path";

import users from "../models/user";

import bcrpyt from "bcrypt";

import { Request, Response } from "express";

import dotenv from "dotenv";

import jwt from "jsonwebtoken";

dotenv.config();

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

    bcrpyt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: "error signup user" });
      }
      if (hash) {
        const createUser = await users.create({
          username: req.body.username,
          email: req.body.email,
          mobileno: req.body.mobileno,
          password: hash,
        });
      }
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({ success: false, message: "signup failed" });
  }
  res.status(200).json({ success: true, message: "signup successfull" });
};

user.getUserlogin = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
};

user.postUserlogin = async (req: Request, res: Response) => { 
  try {
    const { password, email } = req.body;
    const find = await users.findOne({ where: { email: email } });

    if (find) {
      bcrpyt.compare(password, find.dataValues.password, (err, data) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: "err occured logging in",
          });
        }
        if (data === true) {
          console.log("in paswword matched");

          return res.status(200).json({
            message: "password matched succesfully",
            token: generateacesstoken(
              find.dataValues.id,
              find.dataValues.username
            ),
          });
        } else {
          res.status(401).json({
            success: false,
            message: "User not Authorized ",
          });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: true, message: "User not found " });
    }
  } catch (err) {
    console.log(err);
    console.log("in try catch error");

    return res
      .status(400)
      .json({ success: true, message: "an error occured loggin in" });
  }
};

function generateacesstoken(id: number, username: string) {
  return jwt.sign({ userId: id, username: username }, "secretkey");
}

export default user;
