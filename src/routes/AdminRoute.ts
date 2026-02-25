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

router.get("/", firebaseAuth, AdminController.getAdmin);

router.post(
  "/restaurant",
  firebaseAuth,
  upload.single("image"),
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
  "/restaurants",
  firebaseAuth,
  AdminController.getAdminRestaurant
);

router.get(
  "/restaurantsss",
  firebaseAuth,
  AdminController.getRestaurantsWithOrders
);

export default router;
