import { Request, Response, NextFunction } from "express";
import express from "express";
import {createDeliveryCheckoutSession, createMyDelivery, getDeliveryById, paystackDeliveryWebhookHandler, } from "../controllers/DeliveryController";
import { validateDeliveryRequest } from "../middleware/validation";
import multer from "multer";
import { firebaseAuth } from "../middleware/auth";
import { parseFormDataJson } from "../parsedFormData";


const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  "/",
  (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    next();
  },
  upload.single("image"),
  (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
    console.log("MULTER BODY:", req.body);
    console.log("FILE:", req.file);
    next();
  },
  firebaseAuth,
  parseFormDataJson,
  validateDeliveryRequest,
  createMyDelivery
);

router.get(
  "/:deliveryId",
  firebaseAuth,
  getDeliveryById
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
