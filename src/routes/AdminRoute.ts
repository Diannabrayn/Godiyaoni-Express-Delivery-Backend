// routes/AdminRoute.ts
import express from "express";
import { firebaseAuth } from "../middleware/auth";
import AdminController from "../controllers/AdminController";
import multer from "multer";
import { validateMyRestaurantrequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

router.post(
  "/restaurant",
  firebaseAuth,
  upload.single("imageFile"),
  validateMyRestaurantrequest,
  AdminController.createAdminRestaurant
);

router.put(
  "/restaurant/:restaurantId",
  firebaseAuth,
  upload.single("imageFile"),
  validateMyRestaurantrequest,
  AdminController.updateAdminRestaurant
);

router.get(
  "/restaurant",
  firebaseAuth,
  AdminController.getRestaurantsWithOrders
);

router.get(
  "/restaurant",
  firebaseAuth,
  AdminController.getAdminRestaurant
);

router.patch(
  "/orders/:orderId/status",
  firebaseAuth,
  AdminController.updateAdminOrderStatus
);

router.get("/delivery", firebaseAuth, AdminController.getAllDeliveries);

router.patch(
  "/delivery/:deliveryId/status",
  firebaseAuth,
  AdminController.updateAdminDeliveryStatus
);


export default router;
