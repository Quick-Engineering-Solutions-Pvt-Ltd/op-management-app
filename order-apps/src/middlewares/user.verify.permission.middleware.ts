import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

interface JwtPayload {
  id: string;
  email: string;
  userType: string;
  permissions?: string[]; // Optional, based on your use case
}

interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  userType: string;
  iat: number;
  exp: number;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  if (req.headers.cookie) {
    token = req.headers.cookie.split("jwt=")[1];
  } else {
    throw new ErrorHandler(401, "No token provided");
  }
  if (!token) {
    throw new ErrorHandler(401, "No token provided");
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;
    if (decoded.userType !== "admin") {
      throw new ErrorHandler(403, "Not authorized: Admin access required");
    }
    req.user = decoded 
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

///// create a funcation to check throught this what kinds of permission and also check user verify througth admin or not
