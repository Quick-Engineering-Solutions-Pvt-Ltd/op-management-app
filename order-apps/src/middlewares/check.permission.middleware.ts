import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.auth.model";
import Permission from "../models/user.permission.model";
import { config } from "dotenv";
config();

interface CustomRequest extends Request {
  user?: {
    id: string;
    userType: string;
    isVerified: boolean;
    permissions: { resource: string; actions: string[] }[];
  };
}

interface CustomJwtPayload {
  id: string;
  email: string;
  userType: string;
  iat: number;
  exp: number;
  permissions?: { resource: string; actions: string[] }[]; // Include permissions in the token if needed
}

export type UserType = "admin" | "user"; // Matches your schema's enum

export interface AllowedTypes {
  roles: UserType[]; // Array of allowed user types
}

export const requirePermission = (resource: string, action: string) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Extract token from cookie
      let token: string | undefined;
      if (req.headers.cookie) {
        token = req.headers.cookie.split("jwt=")[1]?.split(";")[0]; // Handle cookie parsing safely
      }
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;
      const user = await User.findById(decoded.id)
        .select("userType Isverified")
        .lean();
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
      if (!user.Isverified) {
        return res.status(403).json({
          success: false,
          message: "Verify your account with the admin",
        });
      }
      const permissions = await Permission.find({ userId: decoded.id }).lean();
      req.user = {
        id: user._id.toString(),
        userType: user.userType,
        isVerified: user.Isverified, // Fixed typo
        permissions: permissions.map((perm) => ({
          resource: perm.resource,
          actions: perm.actions,
        })),
      };
      const userPermissions = req.user.permissions || [];
      const resourcePermissions = userPermissions.find(
        (perm) => perm.resource === resource
      );
      // Check if the user has the required action for the resource
      if (
        !resourcePermissions ||
        !resourcePermissions.actions.includes(action)
      ) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${action} on ${resource}`,
        });
      }
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission check",
        error: (error as Error).message,
      });
    }
  };
};

//// check user authenticate or not create middleware
export const authenticateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from cookie
    let token: string | undefined;
    if (req.headers.cookie) {
      token = req.headers.cookie.split("jwt=")[1]?.split(";")[0]; // Handle cookie parsing safely
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as CustomJwtPayload;
    const user = await User.findById(decoded.id)
      .select("userType Isverified")
      .lean();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }
    req.user = {
      id: user._id.toString(),
      userType: user.userType,
      isVerified: user.Isverified,
      permissions: [], // No permissions loaded here; adjust if needed
    };
    next();
  } catch (error: unknown) {
    if (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token has expired",
      });
    }
    if (error instanceof Error) {
      console.error("Authentication error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }
    // Fallback for non-Error objects
    console.error("Authentication error:", String(error));
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

export const restrictTo = (allowedTypes: UserType[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }
    if (!allowedTypes.includes(req.user.userType as UserType)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }
    next();
  };
};

export const restrictToVerifiedUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please log in",
    });
  }
  if (req.user.userType !== "user") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only verified users can access this resource",
    });
  }
  next();
};
