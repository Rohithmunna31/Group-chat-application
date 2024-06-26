import path from "path";

import AWS from "aws-sdk";

import fs from "fs";

import files from "../models/files";

import users from "../models/user";

import Group from "../models/usergroups";

import usergrouprelation from "../models/usergrouprelation";

import bcrypt from "bcrypt";

import { Request, Response } from "express";

import dotenv from "dotenv";

dotenv.config();
import { group } from "console";
import { where } from "sequelize";
import Groups from "../models/usergroups";
import { Op } from "sequelize";
import { errorMessage } from "aws-sdk/clients/datapipeline";

const groups: any = {};

groups.postGroup = async (req: Request, res: Response) => {
  try {
    const groupname = req.body.groupname;

    const thisGroup = await Group.create({
      groupname: groupname,
    });

    await usergrouprelation.create({
      selfGranted: true,
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

    res.status(200).json({
      success: true,
      groups: getUsergroups,
      username: req.user.username,
    });
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

groups.getUsers = async (req: Request, res: Response) => {
  console.log("in getting users");

  try {
    const groupid = req.params.groupid;

    const isadmin = await usergrouprelation.findOne({
      where: {
        UserId: req.user.id,
        usergroupId: groupid,
      },
    });

    const thisgroupsusers = await users.findAll({
      include: [
        {
          model: Groups,
          where: {
            id: groupid,
          },
        },
      ],
    });

    const othergroupusers = await users.findAll({
      include: [
        {
          model: Groups,
          where: {
            id: {
              [Op.not]: groupid,
            },
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      isadmin: isadmin?.dataValues.selfGranted,
      thisgroupsusers: thisgroupsusers,
      othergroupusers: othergroupusers,
    });
  } catch (err) {
    console.log(err);

    res.status(400).json({ success: false });
  }
};

groups.uploadfile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "cannot get file" });
    }

    console.log(req.file);

    const groupid = req.params.groupid;
    const username = req.params.username;

    const userDetails = await users.findOne({
      where: { username: username },
    });

    AWS.config.update({
      region: "ap-southeast-2",
      accessKeyId: process.env.AWS_IAM_USER_KEY,
      secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    });
    const imagePath = req.file.path;
    const contentType = imagePath.endsWith(".jpg")
      ? "image/jpeg"
      : imagePath.endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    const s3 = new AWS.S3();
    const uploadParams: any = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `file${groupid}${username}/${new Date().toLocaleString()}`,
      Body: fs.createReadStream(req.file.path),
      ACL: "public-read",
      ContentType: contentType,
    };

    async function uploadtos3(uploadParams: any): Promise<string> {
      return new Promise((resolve, reject) => {
        s3.upload(uploadParams, (err: Error, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Location);
          }
        });
      });
    }

    const fileUrl: string = await uploadtos3(uploadParams);
    console.log("File uploaded successfully. URL:", fileUrl);

    console.log("this is fileUrl2", fileUrl);
    await files.create({
      fileUrl: fileUrl,
      usergroupId: groupid,
      UserId: userDetails?.dataValues.id,
    });

    res.status(200).json({
      success: true,
      message: "upload done successfully",
      fileUrl: fileUrl,
    });
  } catch (err) {
    return res.status(400).json({ success: true, message: "failed uploading" });
  }
};

export default groups;
