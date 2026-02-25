// controllers/DeliveryOrderController.ts
import { Request, Response } from "express";
import { db } from "../config/firebase";


export const getMyDeliveries = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("delivery")
      .where("userId", "==", req.firebaseId)
      .get();

    const deliveries = snapshot.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ data: deliveries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deliveries" });
  }
};

