import { Request, Response } from "express";
import { firestore } from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import crypto from "crypto";
import { admin } from "../config/firebase";
import { calculateDeliveryPrice, estimatedDeliveryTime } from "../config/deliveryPrice";
import { getDistanceMeters } from "../config/deliveryDistance";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const db = admin.firestore();

/* ================= IMAGE UPLOAD ================= */
const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  const base64Image = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.secure_url;
};

export const createMyDelivery = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    /* Parse multipart JSON */
    const parsed =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body;

    const { sender, receiver, package: pkg, deliveryType } = parsed;

    if (!sender?.address || !receiver?.address) {
      return res
        .status(400)
        .json({ message: "Sender & receiver address required" });
    }

    if (
      !sender.address.lat ||
      !sender.address.lng ||
      !receiver.address.lat ||
      !receiver.address.lng
    ) {
      return res
        .status(400)
        .json({ message: "Invalid address coordinates" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Delivery image is required" });
    }

    /* Upload image */
    const imageUrl = await uploadImage(req.file);

    /* Distance */
    const distanceMeters = await getDistanceMeters(
      sender.address,
      receiver.address
    );

    /* Price */
    const price = calculateDeliveryPrice(distanceMeters, deliveryType);

   const deliveryTimeMinutes = estimatedDeliveryTime(
  distanceMeters,
  deliveryType
);
    /* Build delivery */
    const delivery = {
      userId: (req as any).firebaseId,
      sender,
      receiver,
      package: pkg,
      distanceMeters,
      price,
      deliveryType,
      estimatedDeliveryTime : deliveryTimeMinutes,
      imageUrl,
      status: "placed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

  const ref = await db.collection("delivery").add(delivery);

// 🔥 Fetch the created document
const doc = await ref.get();
const data = doc.data();

return res.status(201).json({
  deliveryId: doc.id,
  ...data,
  createdAt: data?.createdAt?.toDate?.() ?? null,
  lastUpdated: data?.lastUpdated?.toDate?.() ?? null,
});
  } catch (error) {
    return res.status(500).json({ message: "Failed to create delivery" });
  }
};


/* ================= PAYSTACK CHECKOUT ================= */
export const createDeliveryCheckoutSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      return res.status(400).json({ message: "Missing deliveryId" });
    }

    const deliverySnap = await db.collection("delivery").doc(deliveryId).get();

    if (!deliverySnap.exists) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const deliveryData = deliverySnap.data();

    if (!deliveryData) {
      return res.status(404).json({ message: "Delivery data missing" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.body.email ?? "fallback@test.com",
        amount: Math.round(Number(deliveryData.price) * 100),
        reference: `DELIVERY_${deliveryId}_${Date.now()}`,
        callback_url: `godiyaoni://delivery/${deliveryId}`,

        metadata: {
          deliveryId,
          firebaseId: deliveryData.userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({ url: response.data.data.authorization_url });
  } catch (error: any) {
    
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/* ================= GET DELIVERY BY ID ================= */
export const getDeliveryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { deliveryId } = req.params;

    const doc = await db.collection("delivery").doc(deliveryId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    return res.json({
      deliveryId: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch delivery" });
  }
};

/* ================= PAYSTACK WEBHOOK ================= */
export const paystackDeliveryWebhookHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;

    if (!signature) {
      return res.status(400).send("Missing signature");
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body as Buffer)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse((req.body as Buffer).toString("utf8"));

    if (event.event === "charge.success") {
      const deliveryId = event.data.metadata?.deliveryId;

      if (deliveryId) {
        await db.collection("delivery").doc(deliveryId).update({
          status: "paid",
          paymentReference: event.data.reference,
          lastUpdated: firestore.Timestamp.now(),
        });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.sendStatus(500);
  }
};
