// routes/AdminRoute.ts
import express from "express";
import { firebaseAuth } from "../middleware/auth";
import AdminController from "../controllers/AdminController";
import multer from "multer";
import { validateMyRestaurantrequest } from "../middleware/validation";
import { parseFormDataJson } from "../parsedFormData";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
})

router.get("/", firebaseAuth, AdminController.getAdmin);

router.post(
  "/restaurant",
  firebaseAuth,
  upload.any(),
  parseFormDataJson,
  validateMyRestaurantrequest,
  AdminController.createAdminRestaurant
);

router.put(
  "/restaurant/:restaurantId",
  firebaseAuth,
  upload.any(),
  parseFormDataJson,
  validateMyRestaurantrequest,
  AdminController.updateAdminRestaurant
);

router.get("/restaurant", firebaseAuth, AdminController.getAllAdminRestaurant);

// Orders
router.get("/orders", firebaseAuth, AdminController.getAllAdminOrders);

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

router.get(
  "/restaurant",
  firebaseAuth,
  AdminController.getAdminRestaurant
);

router.get(
  "/restaurant",
  firebaseAuth,
  AdminController.getRestaurantsWithOrders
);

export default router;