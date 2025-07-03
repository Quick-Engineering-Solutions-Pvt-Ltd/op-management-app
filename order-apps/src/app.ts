import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import orderRouter from "./routes/order.create.route.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/user.auth.route.js";

dotenv.config({ path: "./.env" });

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "";
console.log(mongoURI);

connectDB(mongoURI);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const allowedOrigins = [
  "exp://o87i5p4-anonymous-8081.exp.direct",
  "http://localhost:5173",
];

// Add CORS_ORIGIN from environment variable if defined
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim().replace(/\/$/, "")
  );
  allowedOrigins.push(...envOrigins);
}

// Dynamic CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/order/api", orderRouter);
app.use("/user/api", userRouter);

app.get("*", (req, res) => {
  console.log("404 Not Found:", req.params, "check params");
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

app.use(errorMiddleware);

app.listen(port, () =>
  console.log(`Server is working on Port: ${port} in ${envMode} Mode.`)
);
