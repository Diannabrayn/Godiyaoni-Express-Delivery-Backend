import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { Delivery } from "../models/Delivery";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import crypto from "crypto";
import { admin } from "../config/firebase";


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

const db = admin.firestore();

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};

// Create delivery
export const createMyDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const newDelivery: Delivery = {
      firebaseId: req.firebaseId,
      sender: {
        name: req.body["sender.name"],
        phone: req.body["sender.phone"],
        pickupAddress: req.body["pickupAddress"],
      },
      receiver: {
        name: req.body["receiver.name"],
        phone: req.body["receiver.phone"],
        dropoffAddress: req.body["dropoffAddress"],
      },
      package: {
        description: req.body["package.description"],
        weight: Number(req.body["package.weight"]),
        value: Number(req.body["package.value"]),
      },
      deliveryType: req.body["deliveryType"],
      price: Number(req.body["price"] ?? 1500),
      estimatedDeliveryTime: Number(req.body["estimatedDeliveryTime"] ?? 30),
      status: "placed",
      createdAt: firestore.Timestamp.now(),
      paymentReference: req.body["paymentReference"] || "",
      imageUrl,
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
      deliveryId: "", // will be set after creation
    };

    // Create doc in Firestore
    const docRef = await db.collection("delivery").add(newDelivery);

    // Update doc with its own ID
    await docRef.update({ deliveryId: docRef.id });

    res.status(201).json({
      ...newDelivery,
      deliveryId: docRef.id,
    });
  } catch (error) {
    console.error("Create delivery failed:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const createDeliveryCheckoutSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      res.status(400).json({ message: "Missing deliveryId" });
      return;
    }

    const deliverySnap = await db.collection("delivery").doc(deliveryId).get();

    if (!deliverySnap.exists) {
      res.status(404).json({ message: "Delivery not found" });
      return;
    }

    const deliveryData = deliverySnap.data();
    if (!deliveryData) {
      res.status(404).json({ message: "Delivery data missing" });
      return;
    }

    // ✅ Create Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: deliveryData.sender?.email || "test@fake.com", // Must provide valid email
        amount: Math.round(Number(deliveryData.price) * 100), // Paystack requires amount in kobo
        reference: `DELIVERY_${deliveryId}_${Date.now()}`,
        callback_url: `${FRONTEND_URL}/delivery-status?deliveryId=${deliveryId}`,
        metadata: {
          deliveryId,
          firebaseId: deliveryData.firebaseId,
          sender: deliveryData.sender,
          receiver: deliveryData.receiver,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ url: response.data.data.authorization_url });
  } catch (error: any) {
    console.error("Paystack error:", error.response?.data || error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getDeliveryOrder = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const docRef = db.collection("delivery").doc(deliveryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ message: "Delivery not found" });
      return;
    }

    res.json({ deliveryId: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const paystackDeliveryWebhookHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;

    if (!signature) {
      res.status(400).send("Missing signature");
      return; // ✅ Added return
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body) // raw buffer
      .digest("hex");

    if (hash !== signature) {
      res.status(401).send("Invalid signature");
      return; // ✅ Added return
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

    res.sendStatus(200);
    return; // ✅ Added return
  } catch (error: any) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
    return; // ✅ Added return
  }
};


