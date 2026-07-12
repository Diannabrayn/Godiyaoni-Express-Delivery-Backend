import { Request, Response, NextFunction } from "express";
import express from "express";
import { validateDoorToDoorDeliveryRequest } from "../middleware/validation";
import multer from "multer";
import { firebaseAuth } from "../middleware/auth";
import { parseFormDataJson } from "../parsedFormData";
import { createDoorToDoorDeliveryCheckoutSession, createMyDoorToDoorDelivery, getDoorToDoorDeliveryById, paystackDoorToDoorDeliveryWebhookHandler } from "../controllers/DoorToDoorDeliveryontroller";


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
  validateDoorToDoorDeliveryRequest,
  createMyDoorToDoorDelivery
);

router.get(
  "/:deliveryId",
  firebaseAuth,
  getDoorToDoorDeliveryById
);

router.post(
  "/checkout/create-checkout-session/:deliveryId",
  firebaseAuth,
  createDoorToDoorDeliveryCheckoutSession
);


router.post(
  "/paystack/webhook",
  express.raw({ type: "application/json" }), // ✅ important
  paystackDoorToDoorDeliveryWebhookHandler
);
export default router;
