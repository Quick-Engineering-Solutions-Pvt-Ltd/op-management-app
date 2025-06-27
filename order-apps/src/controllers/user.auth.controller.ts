import { Request, Response, NextFunction } from "express";
import User from "../models/user.auth.model";
import Permission from "../models/user.permission.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import ErrorHandler from "../utils/errorHandler";
config();

export const adminSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, userType = "user" } = req.body;
    
    if (!username || !email || !password) {
      throw new ErrorHandler(400, "Username or email already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ErrorHandler(400, "Username or email already exists");
    }
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      userType,
      Isverified: false,
      profilePicture: null,
    });
    console.log(user, "check")
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: user._id, username, email, userType },
    });
  } catch (error) {
    next(error);
  }
};

//// create funcation for the user login
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, userType } = req.body;
    // Validate input
    if (!email || !password) {
      throw new ErrorHandler(400, "Email and password are required");
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorHandler(400, "user not founds");
    }
    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(isValidPassword,"invalidadd")
    if (!isValidPassword) {
      throw new ErrorHandler(400, "Invalid email or password");
    }
    // Validate userType if provided
    if (userType && userType !== user.userType) {
      throw new ErrorHandler(400, "Invalid user type");
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email, userType: user.userType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" } // Token expiration time
    );

    // Set JWT in a cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Mitigates CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds, matching token expiration
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

//// admin assign the permission for operation performs
export const assignPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, resource, actions } = req.body;
    if (!userId || !resource || !actions || !Array.isArray(actions)) {
      throw new ErrorHandler(
        400,
        "User ID, resource, and actions are required"
      );
    }
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler(400, "User not found");
    }
    // Validate resource and actions
    const validResources = ["users", "permissions", "orders"];
    const validActions = ["read", "write", "update"];
    if (!validResources.includes(resource)) {
      return res.status(400).json({
        success: false,
        message: `Invalid resource. Must be one of: ${validResources.join(
          ", "
        )}`,
      });
    }
    if (!actions.every((action: string) => validActions.includes(action))) {
      return res.status(400).json({
        success: false,
        message: `Invalid actions. Must be one of: ${validActions.join(", ")}`,
      });
    }
    // Upsert permission (update if exists, create if not)
    await Permission.findOneAndUpdate(
      { userId, resource },
      { actions },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Permissions assigned successfully",
      permission: { userId, resource, actions },
    });
  } catch (error) {
    console.error("Assign permissions error:", error);
    next(error);
  }
};

////// admin create user funcation
export const adminCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      username,
      email,
      password,
      userType = "user",
      employeeId,
    } = req.body;
    if (!username || !email || !password) {
      throw new ErrorHandler(400, "Username, email, and password are required");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ErrorHandler(400, "email already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      userType,
      Isverified: false,
      profilePicture: null,
      employeeId,
    });
    return res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      user: {
        id: user._id,
        username,
        email,
        userType,
        employeeId,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    next(error);
  }
};

export const AdmineCreateuserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, userType } = req.body;
    // Validate input
    if (!email || !password) {
      throw new ErrorHandler(400, "Email and password are required");
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorHandler(400, "Invalid email or password");
    }
    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ErrorHandler(400, "Invalid email or password");
    }
    // Validate userType if provided
    if (userType && userType !== user.userType) {
      throw new ErrorHandler(400, "Invalid user type");
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email, userType: user.userType },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" } // Token expiration time
    );

    // Set JWT in a cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Mitigates CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds, matching token expiration
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

///// creat a funcation for the admin verify the user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { Isverified: true } },
      { new: true, select: "userType Isverified" }
    );
    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: {
        userType: updatedUser!.userType,
        Isverified: updatedUser!.Isverified,
      },
    });
  } catch (error) {
    console.error("Verify user error:", error);
    next(error);
  }
};

//// create funcation change password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword, email } = req.body;
    // Validate input
    if (!email || !oldPassword || !newPassword) {
      throw new ErrorHandler(
        400,
        "email, old password, and new password are required"
      );
    }
    // Validate password strength (example: minimum 8 characters)
    if (newPassword.length < 8) {
      throw new ErrorHandler(
        400,
        "New password must be at least 8 characters long"
      );
    }
    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new ErrorHandler(400, "Invalid old password");
    }
    // Prevent same password reuse
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ErrorHandler(
        400,
        "New password cannot be the same as old password"
      );
    }
    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};




