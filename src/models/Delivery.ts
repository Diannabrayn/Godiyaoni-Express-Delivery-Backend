import { firestore } from "firebase-admin";

export interface Delivery {
  deliveryId: string;
  firebaseId: string;
  sender: {
    name: string;
    phone: string;
    pickupAddress: string;
  };
  receiver: {
    name: string;
    phone: string;
    dropoffAddress: string;
  };
  package: {
    description: string;
    weight: number;
    value: number;
  };
  deliveryType: "standard" | "express" | "same-day";
  price: number;
  estimatedDeliveryTime: number;
  status: "placed" | "paid" | "inProgress" | "outForDelivery" | "delivered";
  createdAt: firestore.Timestamp;
  lastUpdated: firestore.Timestamp;
  paymentReference: string;
  imageUrl: string;
}
