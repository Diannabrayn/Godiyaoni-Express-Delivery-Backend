// types/Order.ts

import { Restaurant } from "./restaurant";

export type OrderStatus =
  | "placed"
  | "paid"
  | "inProgress"
  | "outForDelivery"
  | "delivered";

export interface CartItem {
  menuItemId: string;
  quantity: number;
  name: string;
}

export interface DeliveryDetails {
  email: string;
  name: string;
  addressLine1: string;
  phone: number;
  city: string;
}

export interface Order {
  id: string; // Optional, Firestore document ID
  restaurant: Restaurant;
  userId: string;
  deliveryDetails: DeliveryDetails;
  cartItems: CartItem[];
  paymentReference?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: FirebaseFirestore.Timestamp;
}
