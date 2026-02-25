import express from "express";
import {createDeliveryCheckoutSession, createMyDelivery, getDeliveryOrder, paystackDeliveryWebhookHandler, } from "../controllers/DeliveryController";
import { validateDeliveryRequest } from "../middleware/validation";
import multer from "multer";
import { firebaseAuth } from "../middleware/auth";


const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Create a delivery with image + validation

router.post(
  "/",
  firebaseAuth,
  upload.single("image"),
  validateDeliveryRequest,
  createMyDelivery
);

router.get(
  "/:deliveryId",
  firebaseAuth,
  getDeliveryOrder
);

router.post(
  "/checkout/create-checkout-session/:deliveryId",
  firebaseAuth,
  createDeliveryCheckoutSession
);


router.post(
  "/paystack/webhook",
  express.raw({ type: "application/json" }), // ✅ important
  paystackDeliveryWebhookHandler
);
export default router;
