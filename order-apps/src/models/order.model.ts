import mongoose from "mongoose";
import Product from "./product.model";

const orderSchema = new mongoose.Schema(
{
    orderNumber: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    companyName: { type: String },
    gstNumber: {
      type: String,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          const gstRegex =
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          return gstRegex.test(value);
        },
        message:
          "GST number must be exactly 15 characters and follow the valid Indian GST format (e.g., 27AABCU9603R1ZM)",
      },
    },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String },
    products: [Product.schema],
    estimatedDispatchDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    generatedBy: {
      name: { type: String, required: true },
      employeeId: { type: String, required: true },
    },
    formGeneratedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
