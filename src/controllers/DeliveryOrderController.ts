import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Delivery } from "../models/Delivery";

export const getDelivery = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("delivery")
      .where("firebaseId", "==", req.firebaseId)
      .get();

    const delivery: Delivery[] = snapshot.docs.map((doc) => {
      const deliveryData = doc.data();

      return {
        deliveryId: doc.id,
        ...deliveryData,
      } as Delivery;
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
