import mongoose from "mongoose";

export const connectDB = (uri: string) =>
  mongoose
    .connect(uri)
    .then((c) => {
      console.log(`Connected to MongoDB with database: ${c.connection.name}`);
    })
    .catch((e) => {
      console.error("MongoDB connection error:", e);
      throw e;
});
