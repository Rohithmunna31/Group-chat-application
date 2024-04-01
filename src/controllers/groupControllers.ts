import path from "path";

import users from "../models/user";

import Group from "../models/usergroups";

import usergrouprelation from "../models/usergrouprelation";

import bcrypt from "bcrypt";

import { Request, Response } from "express";

import dotenv from "dotenv";
import { group } from "console";
import { where } from "sequelize";

const groups: any = {};

groups.postGroup = async (req: Request, res: Response) => {
  try {
    const groupname = req.body.groupname;

    const thisGroup = await Group.create({
      groupname: groupname,
    });
    console.log(thisGroup.dataValues.id);

    await usergrouprelation.create({
      UserId: req.user.id,
      usergroupId: thisGroup.dataValues.id,
    });

    res
      .status(200)
      .json({ success: true, message: "group created successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "failed creating group" });
  }
};

groups.getGroups = async (req: Request, res: Response) => {
  try {
    const getUsergroups = await Group.findAll({
      include: [
        {
          model: users,
          where: {
            id: req.user.id,
          },
        },
      ],
    });

    console.log(getUsergroups);

    res.status(200).json({ success: true, groups: getUsergroups });
  } catch (err) {
    console.log(err);

    res.status(400).json({ success: true, message: "failed getting groups" });
  }
};

groups.getJoingroup = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/joingroup.html"));
};

groups.postJoingroup = async (req: Request, res: Response) => {
  console.log("in post join group");

  try {
    const groupid = req.params.groupid;
    const { password, email } = req.body;
    const find = await users.findOne({ where: { email: email } });

    if (find) {
      bcrypt.compare(password, find.dataValues.password, async (err, data) => {
        if (err) {
          return res.status(404).json({
            success: false,
            message: "err joining group",
          });
        }
        if (data === true) {
          console.log("joining group ");

          const relation = await usergrouprelation.findAll({
            where: {
              UserId: find.dataValues.id,
              usergroupId: groupid,
            },
          });

          console.log(relation);

          if (relation.length == 0) {
            console.log("creating user group relation");

            await usergrouprelation.create({
              UserId: find.dataValues.id,
              usergroupId: groupid,
            });

            return res
              .status(200)
              .json({ success: true, message: "joined group successfully" });
          } else {
            console.log("user already in group");

            return res
              .status(404)
              .json({ success: false, message: "user already in the group" });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "User not Authorized",
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

    return res
      .status(400)
      .json({ success: true, message: "an error occured loggin in" });
  }
};

export default groups;
