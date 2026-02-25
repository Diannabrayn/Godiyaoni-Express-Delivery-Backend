import { firestore } from "firebase-admin";

export type Coordinates = {
  text: string;
  lat: number;
  lng: number;
};

export interface Delivery {
  deliveryId: string;
  userId: string | null;

  sender: {
    name: string;
    phone: string;
    email: string;
    address: Coordinates;
  };

  receiver: {
    name: string;
    phone: string;
    address: Coordinates;
  };

  distanceMeters: number;
  estimatedDeliveryTime: number;
  deliveryType: "standard" | "express" | "same-day";
  price: number;

  status: "placed" | "paid" | "inProgress" | "outForDelivery" | "delivered";
  paymentReference?: string;

  createdAt: firestore.Timestamp;
  lastUpdated?: firestore.Timestamp;
}

