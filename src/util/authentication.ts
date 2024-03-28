import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config();

const middleWare: object | any = {};

middleWare.authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.body.Authorization;
  console.log(token);

  if (!token) {
    console.log("here in !token");
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  try {
    console.log(process.env.SECRET_KEY);
    const user: any = jwt.verify(token, process.env.SECRET_KEY!);
    User.findByPk(user.userId)
      .then((userone: any) => {
        if (!userone) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = userone.dataValues;
        next();
      })
      .catch((err: any) => {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default middleWare;
