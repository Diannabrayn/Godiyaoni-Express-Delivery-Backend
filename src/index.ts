
import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { admin } from "./config/firebase"; // ✅ Correctly importing Firebase
import MyUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import OrderRoutes from "./routes/OrderRoute";
import RestaurantRoutes from "./routes/RestaurantRoutes";
import DeliveryRoutes from "./routes/DeliveryRoute";
import DeliveryOrderRoute from "./routes/DeliveryOrderRoute";
import AdminRoute from "./routes/AdminRoute";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // You can customize this if needed

// Health check route
app.get("/health", async (_req: Request, res: Response) => {
  res.send({ message: "Health check passed!" });
});

// Routes
app.use("/api/my/admin", AdminRoute);
app.use("/api/my/user", MyUserRoute);
app.use("/api/my/restaurant", MyRestaurantRoute);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/delivery", DeliveryRoutes);
app.use("/api/delivery", DeliveryOrderRoute);



// Firestore Example Usage
const db = admin.firestore(); // ✅ Correct way to access Firestore
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

// Start server
app.listen(8000, "0.0.0.0",() => {
  console.log("🔥 Server started on http://localhost:8000");
});

// Export as a Firebase Function
export const api = functions.https.onRequest(app);
