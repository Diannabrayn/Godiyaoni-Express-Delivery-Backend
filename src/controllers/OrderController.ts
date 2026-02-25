import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../config/firebase";
import { Restaurant } from "../models/restaurant";
import { firestore } from "firebase-admin";
import { Order } from "../models/Order";
import axios from "axios";

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;




const getMyOrders = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("orders")
      .where("userId", "==", req.firebaseId)
      .get();

    const orders: Order[] = snapshot.docs.map((doc) => {
      const orderData = doc.data();

      return {
        id: doc.id,
        ...orderData,
        restaurant: orderData.restaurant || {
          restaurantName: "Unknown Restaurant",
          imageUrl: "/placeholder.png",
          estimatedDeliveryTime: 0,
        },
      } as Order;
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ✅ Paystack Webhook Handler
const paystackOrderWebhookHandler = async (req: Request, res: Response) => {
  try {
    const secret = PAYSTACK_SECRET_KEY;

    const signature = req.headers["x-paystack-signature"] as string;
    if (!signature) {
       res.status(400).send("Missing Paystack signature");
    }

    // ✅ Verify signature with raw Buffer
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body) // req.body is Buffer now
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Paystack signature");
     res.status(401).send("Invalid signature");
    }

    // ✅ Parse the JSON event
    const event = JSON.parse((req.body as Buffer).toString("utf8"));
    console.log("🚀 Paystack Webhook Event:", event);

    if (event.event === "charge.success") {
      const metadata = event.data.metadata;
      const orderId = metadata?.orderId;

      if (orderId) {
        await db
          .collection("orders")
          .doc(orderId)
          .update({
            status: "paid",
            totalAmount: event.data.amount / 100,
            paymentReference: event.data.reference,
            paidAt: firestore.Timestamp.now(),
          });
        console.log(`✅ Order ${orderId} marked as PAID`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
};



const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cartItems, deliveryDetails, restaurantId } = req.body;

    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }

    // ✅ Fetch restaurant by its doc ID
    const restaurantRef = db.collection("restaurant").doc(restaurantId);
    const restaurantSnap = await restaurantRef.get();

    if (!restaurantSnap.exists) {
      throw new Error("Restaurant not found");
    }

    const restaurant = restaurantSnap.data() as Restaurant;

    // ✅ Calculate total amount (items + delivery fee)
    const totalAmount =
      cartItems.reduce((sum: number, item: any) => {
        const menuItem = restaurant.menuItem.find(
          (m) => m.id === item.menuItemId
        );
        return (
          sum + (menuItem ? Number(menuItem.price) * Number(item.quantity) : 0)
        );
      }, 0) + (restaurant.deliveryPrice || 0);

    // ✅ Create a new Firestore order
    const orderDocRef = db.collection("orders").doc();

    const newOrder = {
      id: orderDocRef.id,
      restaurantId,
      restaurant,
      userId: req.firebaseId, // comes from auth middleware
      status: "placed",
      deliveryDetails,
      cartItems,
      totalAmount,
      createdAt: firestore.Timestamp.now(),
    };

    await orderDocRef.set(newOrder);

    // ✅ Initialize Paystack payment
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: deliveryDetails.email,
        amount: Math.round(totalAmount * 100), // Paystack expects kobo
        reference: `ORDER_${Date.now()}`,
        callback_url: `${FRONTEND_URL}/order-status`,
        metadata: {
          restaurant,
          cartItems,
          deliveryDetails,
          orderId: orderDocRef.id,
          userId: req.firebaseId,
          restaurantId,
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
    res.status(500).json({ message: error.message });
  }
};



export default {
  getMyOrders,
  createCheckoutSession,
  paystackOrderWebhookHandler,
};
