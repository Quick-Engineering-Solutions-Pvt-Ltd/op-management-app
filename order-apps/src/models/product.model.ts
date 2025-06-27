import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
    remark: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
