// controllers/DeliveryOrderController.ts
import { Request, Response } from "express";
import { db } from "../config/firebase";


export const getMyPickUpDeliveries = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("PickUpdelivery")
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

export const getMyDoorToDoorDeliveries = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("doorToDoorDelivery")
      .where("userId", "==", req.firebaseId)
      .get();

    const deliveries = snapshot.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ data: deliveries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doorToDoorDeliveries" });
  }
};

export const getMyMotorParkDeliveries = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("motorParkDelivery")
      .where("userId", "==", req.firebaseId)
      .get();

    const deliveries = snapshot.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ data: deliveries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doorToDoorDeliveries" });
  }
};

export const getMyWayBillDeliveries = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("wayBillDelivery")
      .where("userId", "==", req.firebaseId)
      .get();

    const deliveries = snapshot.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ data: deliveries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wayBill Deliveries" });
  }
};

