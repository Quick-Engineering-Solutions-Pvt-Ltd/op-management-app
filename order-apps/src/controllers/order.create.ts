/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import { FilterQuery } from "mongoose";
import ErrorHandler from "../utils/errorHandler";
import User from "../models/user.auth.model";
import { createOrderNotification } from "./notificationService.js";

// Function to generate orderNumber in format "01/QESPL/JUN/25"
export const createOrderNumber = async (
  date: Date = new Date()
): Promise<string> => {
  const year = date.getFullYear();
  const monthName = date
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const yearShort = year.toString().slice(-2);

  // Get the next sequence number for the current month
  const prefix = `QESPL/${monthName}/${yearShort}`;
  const regex = new RegExp(`^\\d{2}/${prefix}$`);
  const lastOrder = await Order.findOne({ orderNumber: regex })
    .sort({ orderNumber: -1 })
    .select("orderNumber")
    .lean();
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split("/")[0], 10);
    sequence = lastSequence + 1;
  }

  const orderNumber = `${String(sequence).padStart(2, "0")}/${prefix}`;
  return orderNumber;
};

export const orderCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      orderNumber: providedOrderNumber,
      clientName,
      companyName,
      gstNumber,
      contact,
      address,
      zipCode,
      products,
      estimatedDispatchDate,
      generatedBy,
      formGeneratedBy,
    } = req.body;
    // Basic required field validation
    if (
      !clientName ||
      !contact ||
      !address ||
      !zipCode ||
      !products ||
      !generatedBy ||
      !generatedBy.name ||
      !generatedBy.employeeId
    ) {
      throw new ErrorHandler(400, "Missing or invalid required fields");
    }
    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      throw new ErrorHandler(
        400,
        "Products array is required and cannot be empty"
      );
    }
    for (const product of products) {
      if (
        !product.name ||
        typeof product.price !== "number" ||
        typeof product.quantity !== "number" ||
        product.quantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each product must have a name, a valid price (number), and a valid quantity (non-negative number)",
        });
      }
    }
    // Generate order number if not provided
    const orderNumber = providedOrderNumber || (await createOrderNumber());
    // Create and save the order
    const newOrder = new Order({
      orderNumber,
      clientName,
      companyName,
      gstNumber,
      contact,
      address,
      zipCode,
      products,
      estimatedDispatchDate,
      generatedBy,
      formGeneratedBy,
    });
    const savedOrder = await newOrder.save();
    const userSocketMap: Map<string, string> = req.app.get("userSocketMap");

    // Assuming req.user.id contains the authenticated user's ID
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.id;
    // // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //  const io = (req.app as any).get("io");
    const io = req.app.get("io");
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const userSocketMap = (req.app as any).get("userSocketMap");
    await createOrderNotification(
      savedOrder._id.toString(),
      userId,
      io,
      userSocketMap,
      "create"
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

//// get details by order details by ID
export const getOrderDetailsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      throw new ErrorHandler(400, "Order not found");
    }
    return res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: order,
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ErrorHandler(400, "Invalid Order ID format");
    }
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    if (page < 1) {
      throw new ErrorHandler(400, "Page number must be a positive integer");
    }
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = await Order.find().skip(skip).sort({ createdAt: -1 });
    if (page > totalPages && totalOrders > 0) {
      throw new ErrorHandler(
        400,
        `Page ${page} exceeds total pages (${totalPages})`
      );
    }
    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
        },
      },
    });
  } catch (error: unknown) {
    next(error as Error);
  }
};

//// craete a funcation for the user manualy update Isverify fields
export const updateIsVerified = async (userId: string) => {
  try {
    const user = await User.findById(userId).select("userType Isverified");
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { Isverified: !user.Isverified } }, // Toggle Isverified
      { new: true, select: "userType Isverified" }
    );
    return {
      success: true,
      message: `User verification status toggled to ${updatedUser!.Isverified}`,
      user: {
        userType: updatedUser!.userType,
        Isverified: updatedUser!.Isverified,
      },
    };
  } catch (error) {
    console.error("Verify user error:", error);
    throw new ErrorHandler(500, "Internal server error");
  }
};

///// create a function update order details by ID
export const updateOrderDetailsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      orderNumber,
      clientName,
      companyName,
      gstNumber,
      contact,
      address,
      zipCode,
      products,
      estimatedDispatchDate,
      generatedBy,
      formGeneratedBy,
      orderCategory,
    } = req.body;
    // Validate required fields
    if (
      !clientName ||
      !contact ||
      !address ||
      !zipCode ||
      !products ||
      !generatedBy ||
      !generatedBy.name ||
      !generatedBy.employeeId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      throw new ErrorHandler(
        400,
        "Products array is required and cannot be empty"
      );
    }
    for (const product of products) {
      if (
        !product.name ||
        typeof product.price !== "number" ||
        typeof product.quantity !== "number" ||
        product.quantity < 0
      ) {
        throw new ErrorHandler(
          400,
          "Each product must have a name, a valid price (number), and a valid quantity (non-negative number)"
        );
      }
    }
    // Validate GST number if provided
    if (gstNumber) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber)) {
        throw new ErrorHandler(
          400,
          "GST number must be exactly 15 characters and follow the valid Indian GST format (e.g., 27AABCU9603R1ZM)"
        );
      }
    }
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderNumber,
        clientName,
        companyName,
        gstNumber,
        contact,
        address,
        zipCode,
        products,
        estimatedDispatchDate,
        generatedBy,
        formGeneratedBy,
        orderCategory,
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );
    if (!updatedOrder) {
      throw new ErrorHandler(400, "Order not found");
    }
    ///// create a notification for the updated order
    const userSocketMap: Map<string, string> = req.app.get("userSocketMap");
    console.log("User Socket Map:", req.app);
    const userId = (req as any).user?.id;
    const io = req.app.get("io");
    if (updatedOrder) {
      await createOrderNotification(
        updatedOrder._id.toString(),
        userId,
        io,
        userSocketMap,
        "update"
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verificationResult = await updateIsVerified((req as any).user.id);
    // Return the updated order
    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
      verificationResult: verificationResult,
    });
  } catch (error) {
    next(error);
  }
};

///// create funcation for the searching base on this parameters like clientName, companyName,  products.name, generatedBy.name
export const searchOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    const searchQuery: FilterQuery<typeof Order> = {};
    if (query && typeof query === "string") {
      const regex = { $regex: new RegExp(query, "i") }; // Case-insensitive regex
      searchQuery.$or = [
        { clientName: regex },
        { companyName: regex },
        { "products.name": regex },
        { "generatedBy.name": regex },
        { orderNumber: regex },
      ];
    }
    const orders = await Order.find(searchQuery).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
