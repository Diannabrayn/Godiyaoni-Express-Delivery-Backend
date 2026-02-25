import { db } from "../config/firebase";
import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import { firestore } from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";


const getAdminRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantDoc = await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .get();

    if (!restaurantDoc.exists) {
      res.status(404).json({ message: "Restaurant not found!" });
      return;
    }

    // Explicitly cast the Firestore document data to the Restaurant type
    const restaurantData = restaurantDoc.data() as Restaurant;

    res.json(restaurantData); // Return the typed restaurant data
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching the restaurant!" });
  }
};

// ---------------- CREATE ADMIN RESTAURANT ----------------
const createAdminRestaurant = async (req: Request, res: Response) => {
  try {
    const {
      restaurantName,
      city,
      country,
      deliveryPrice,
      estimatedDeliveryTime,
      cuisines,
      menuItem,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file as Express.Multer.File);
    }

    const restaurantRef = db.collection("restaurant").doc();

    const newRestaurant: Restaurant = {
      restaurantId: restaurantRef.id,
      firebaseId: req.firebaseId, // user creating restaurant
      restaurantName,
      restaurantNameLower: restaurantName.toLowerCase(), // <-- lowercase for search
      city,
      cityLower: city.toLowerCase(), // <-- lowercase for search
      country,
      deliveryPrice: Number(deliveryPrice),
      estimatedDeliveryTime: Number(estimatedDeliveryTime),
      cuisines: Array.isArray(cuisines) ? cuisines : [cuisines],
      menuItem: (menuItem || []).map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      })),
      imageUrl,
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
      User: req.firebaseId,
    };

    await restaurantRef.set(newRestaurant);
    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res
      .status(500)
      .json({ message: "Something went wrong creating your restaurant!" });
  }
};



// ---------------- UPDATE ADMIN RESTAURANT ----------------
// ---------------- UPDATE ADMIN RESTAURANT ----------------
const updateAdminRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    const restaurantDoc = await db
      .collection("restaurant")
      .doc(restaurantId)
      .get();

    if (!restaurantDoc.exists) {
      res.status(404).json({ message: "Restaurant not found!" });
      return;
    }

    const existingRestaurant = restaurantDoc.data() as Restaurant;

    const updatedRestaurant: Restaurant = {
      ...existingRestaurant,
      restaurantName:
        req.body.restaurantName ?? existingRestaurant.restaurantName,
      restaurantNameLower: req.body.restaurantName
        ? req.body.restaurantName.toLowerCase()
        : existingRestaurant.restaurantNameLower, // <-- lowercase
      city: req.body.city ?? existingRestaurant.city,
      cityLower: req.body.city
        ? req.body.city.toLowerCase()
        : existingRestaurant.cityLower, // <-- lowercase
      country: req.body.country ?? existingRestaurant.country,
      deliveryPrice: req.body.deliveryPrice
        ? Number(req.body.deliveryPrice)
        : existingRestaurant.deliveryPrice,
      estimatedDeliveryTime: req.body.estimatedDeliveryTime
        ? Number(req.body.estimatedDeliveryTime)
        : existingRestaurant.estimatedDeliveryTime,
      cuisines: req.body.cuisines
        ? Array.isArray(req.body.cuisines)
          ? req.body.cuisines
          : [req.body.cuisines]
        : existingRestaurant.cuisines,
      menuItem: req.body.menuItem
        ? req.body.menuItem.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            name: item.name,
            price:
              typeof item.price === "string"
                ? parseFloat(item.price)
                : item.price,
          }))
        : existingRestaurant.menuItem,
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
      imageUrl: existingRestaurant.imageUrl,
      User: existingRestaurant.User,
      firebaseId: existingRestaurant.firebaseId,
      restaurantId: existingRestaurant.restaurantId,
    };

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      updatedRestaurant.imageUrl = imageUrl;
    }

    await db
      .collection("restaurant")
      .doc(restaurantId)
      .set(updatedRestaurant, { merge: true });

    res.status(200).json(updatedRestaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res
      .status(500)
      .json({ message: "Something went wrong updating the restaurant!" });
  }
};




// ---------------- UPDATE ORDER STATUS ----------------
const updateAdminOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Missing order status" });
      return;
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    await orderRef.update({
      status,
      updatedAt: new Date(),
    });

    res.json({ message: "Order status updated successfully!" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// ---------------- GET ALL RESTAURANTS WITH ORDERS ----------------
const getRestaurantsWithOrders = async (req: Request, res: Response) => {
  try {
    const restaurantsSnapshot = await db.collection("restaurant").get();

    const restaurantsWithOrders = await Promise.all(
      restaurantsSnapshot.docs.map(async (doc) => {
        const restaurantData = doc.data();

        // ✅ Include both the document ID and the firebaseId (creator ID)
        const restaurant = {
          id: doc.id, // Firestore doc ID (for updates, deletes, relations)
          firebaseId: restaurantData.firebaseId, // user/admin who created it
          ...restaurantData,
        };

        // ✅ Fetch orders belonging to this restaurant
        const ordersSnapshot = await db
          .collection("orders")
          .where("restaurantId", "==", doc.id)
          .get();

        const orders = ordersSnapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
        }));

        return { ...restaurant, orders };
      })
    );

    res.json(restaurantsWithOrders);
  } catch (error) {
    console.error("Error fetching restaurants with orders:", error);
    res.status(500).json({ error: "Failed to fetch restaurants with orders" });
  }
};

const getAllDeliveries = async (req: Request, res: Response) => {
  try {
    // ✅ Check if user is super admin
    const userRef = db.collection("admin").doc(req.firebaseId);
    const userSnap = await userRef.get();

    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      res.status(403).json({ message: "Unauthorized" });
      return; 
    }

    // ✅ Fetch all deliveries
    const deliveriesSnap = await db.collection("delivery").get();

    const deliveries = deliveriesSnap.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    res.json(deliveries);
  } catch (error) {
    console.error("Error fetching all deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateAdminDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Missing delivery status" });
      return;
    }

    const deliveryRef = db.collection("delivery").doc(deliveryId);
    const deliveryDoc = await deliveryRef.get();

    if (!deliveryDoc.exists) {
      res.status(404).json({ message: "delivery not found" });
      return;
    }

    await deliveryRef.update({
      status,
      updatedAt: new Date(),
    });

    res.json({ message: "Delivery status updated successfully!" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};





export default {
  getAdminRestaurant,
    updateAdminDeliveryStatus,
    getAllDeliveries,
  getRestaurantsWithOrders,
  updateAdminOrderStatus,
  updateAdminRestaurant,
  createAdminRestaurant,
};