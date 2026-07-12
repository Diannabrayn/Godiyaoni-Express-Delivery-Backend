import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { admin } from "./config/firebase";
import MyUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import OrderRoutes from "./routes/OrderRoute";
import RestaurantRoutes from "./routes/RestaurantRoutes";
import PickUpDeliveryRoutes from "./routes/PickUpDeliveryRoute";
import LogisticsHistoryRoutes from "./routes/LogisticsHistoryRoutes";
import AdminRoute from "./routes/AdminRoute";
import DoorToDoorDeliveryRoutes from "./routes/DoorToDoorDeliveryRoutes";
import WayBillDeliveryRoutes from "./routes/WayBillDeliveryRoutes";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get("/health", async (_req: Request, res: Response) => {
  res.send({ message: "Health check passed!" });
});

// Routes
app.use("/api/my/admin", AdminRoute);
app.use("/api/my/user", MyUserRoute);
app.use("/api/my/restaurant", MyRestaurantRoute);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/pickUpDelivery", PickUpDeliveryRoutes);
app.use("/api/doorToDoorDelivery", DoorToDoorDeliveryRoutes);
app.use("/api/motroParkDelivery", DoorToDoorDeliveryRoutes);
app.use("/api/wayBillDelivery", WayBillDeliveryRoutes);
app.use("/api/delivery", LogisticsHistoryRoutes);

// Firestore test
const db = admin.firestore();

app.get("/test-firestore", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("test").get();
    const docs = snapshot.docs.map((doc) => doc.data());
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error("Firestore Error:", error);
    res.status(500).json({ success: false });
  }
});

// IMPORTANT FOR RENDER
const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server started on port ${PORT}`);
});

// Firebase Function export
export const api = functions.https.onRequest(app);