import { db } from "../config/firebase";
import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import { firestore } from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

/**
 * ===============================
 * ROLE AUTHORIZATION
 * ===============================
 * Only admins or restaurant managers are allowed
 */
const assertAdminOrManager = async (firebaseId: string) => {
  const adminRef = db.collection("admin").doc(firebaseId);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists) {
    throw new Error("UNAUTHORIZED");
  }

  const role = adminSnap.data()?.role;
  if (role !== "admin" && role !== "restaurant_manager") {
    throw new Error("FORBIDDEN");
  }
};

const getAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseId = (req as any).firebaseId;
    if (!firebaseId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userDoc = await db.collection("admin").doc(firebaseId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "Admin not found!" });
      return;
    }

    const userData = userDoc.data();

    if (userData?.isDisabled || userData?.isBlocked) {
      res
        .status(403)
        .json({ message: "Your account is disabled or blocked." });
    }
    res.json(userData);
    return;
    
  } catch (error) {
    console.error("Error getting admin:", error);
    res
      .status(500)
      .json({ message: "Something went wrong getting the current admin!" });
    return;
  }
};

/**
 * ===============================
 * GET ADMIN RESTAURANT (OWNED)
 * ===============================
 */
const getAdminRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantDoc = await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .get();

    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    const restaurantData = restaurantDoc.data() as Restaurant;
    return res.json(restaurantData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching the restaurant!" });
  }
};

const getAllAdminRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantsSnapshot = await db.collection("restaurant").get();
    const restaurants = restaurantsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.json(restaurants);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch restaurants" });
  }
};


/**
 * ===============================
 * CREATE RESTAURANT (ADMIN / MANAGER)
 * ===============================
 */
const createAdminRestaurant = async (req: Request, res: Response) => {
  try {
    await assertAdminOrManager(req.firebaseId);

    const {
      restaurantName,
      city,
      country,
      restaurantAddress,
      deliveryPrice,
      estimatedDeliveryTime,
      cuisines,
      menuItem,
    } = req.body;

    // ✅ Parse address AFTER destructuring
    const parsedAddress =
      typeof restaurantAddress === "string"
        ? JSON.parse(restaurantAddress)
        : restaurantAddress;

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file as Express.Multer.File);
    }

    const restaurantRef = db.collection("restaurant").doc();

    const newRestaurant: Restaurant = {
      restaurantId: restaurantRef.id,
      firebaseId: req.firebaseId,
      userId: req.firebaseId,

      restaurantName,
      restaurantNameLower: restaurantName.toLowerCase(),

      address: {
        text: parsedAddress.text,
        lat: Number(parsedAddress.lat),
        lng: Number(parsedAddress.lng),
      },

      city,
      cityLower: city.toLowerCase(),
      country,

      deliveryTimeMinutes: Number(estimatedDeliveryTime),
      deliveryPrice: Number(deliveryPrice),

      cuisines: Array.isArray(cuisines) ? cuisines : [cuisines],
      cuisinesLower: Array.isArray(cuisines)
        ? cuisines.map((c: string) => c.toLowerCase())
        : [cuisines.toLowerCase()],

      menuItem: (menuItem || []).map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        nameLower: item.name.toLowerCase(),
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
      })),

      imageUrl,
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
    };

    await restaurantRef.set(newRestaurant);
    return res.status(201).json(newRestaurant);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.error(error);
    return res.status(500).json({
      message: "Something went wrong creating your restaurant!",
    });
  }
};


/**
 * ===============================
 * UPDATE RESTAURANT (ADMIN / MANAGER)
 * ===============================
 */
const updateAdminRestaurant = async (req: Request, res: Response) => {
  try {
    await assertAdminOrManager(req.firebaseId);

    const { restaurantId } = req.params;

    const restaurantDoc = await db
      .collection("restaurant")
      .doc(restaurantId)
      .get();

    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    const existingRestaurant = restaurantDoc.data() as Restaurant;

    // ✅ Parse address AFTER existingRestaurant exists
    const parsedAddress = req.body.address
      ? typeof req.body.address === "string"
        ? JSON.parse(req.body.address)
        : req.body.address
      : existingRestaurant.address;

    const updatedRestaurant: Restaurant = {
      ...existingRestaurant,

      restaurantName:
        req.body.restaurantName ?? existingRestaurant.restaurantName,
      restaurantNameLower: req.body.restaurantName
        ? req.body.restaurantName.toLowerCase()
        : existingRestaurant.restaurantNameLower,

      address: parsedAddress,

      city: req.body.city ?? existingRestaurant.city,
      cityLower: req.body.city
        ? req.body.city.toLowerCase()
        : existingRestaurant.cityLower,

      country: req.body.country ?? existingRestaurant.country,

      deliveryPrice: req.body.deliveryPrice
        ? Number(req.body.deliveryPrice)
        : existingRestaurant.deliveryPrice,

      deliveryTimeMinutes: req.body.estimatedDeliveryTime
        ? Number(req.body.estimatedDeliveryTime)
        : existingRestaurant.deliveryTimeMinutes,

      cuisines: req.body.cuisines
        ? Array.isArray(req.body.cuisines)
          ? req.body.cuisines
          : [req.body.cuisines]
        : existingRestaurant.cuisines,

      cuisinesLower: req.body.cuisines
        ? Array.isArray(req.body.cuisines)
          ? req.body.cuisines.map((c: string) => c.toLowerCase())
          : [req.body.cuisines.toLowerCase()]
        : existingRestaurant.cuisinesLower,

      menuItem: req.body.menuItem
        ? req.body.menuItem.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            name: item.name,
            nameLower: item.name.toLowerCase(),
            price: Number(item.price),
            imageUrl: item.imageUrl || "",
          }))
        : existingRestaurant.menuItem,

      lastUpdated: firestore.Timestamp.fromDate(new Date()),
    };

    if (req.file) {
      updatedRestaurant.imageUrl = await uploadImage(
        req.file as Express.Multer.File
      );
    }

    await db
      .collection("restaurant")
      .doc(restaurantId)
      .set(updatedRestaurant, { merge: true });

    return res.status(200).json(updatedRestaurant);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.error(error);
    return res.status(500).json({
      message: "Something went wrong updating the restaurant!",
    });
  }
};

/**
 * ===============================
 * UPDATE ORDER STATUS
 * ===============================
 */
const updateAdminOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "paid",
      "inProgress",
      "outForDelivery",
      "delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    await orderRef.update({
      status,
      updatedAt: firestore.Timestamp.now(),
    });

    return res.json({ message: "Order status updated successfully!" });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

/**
 * ===============================
 * GET RESTAURANTS WITH ORDERS
 * ===============================
 */
const getRestaurantsWithOrders = async (req: Request, res: Response) => {
  try {
    const restaurantsSnapshot = await db.collection("restaurant").get();

    const restaurantsWithOrders = await Promise.all(
      restaurantsSnapshot.docs.map(async (doc) => {
        const restaurantData = doc.data();

        const ordersSnapshot = await db
          .collection("orders")
          .where("restaurantId", "==", doc.id)
          .get();

        const orders = ordersSnapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
        }));

        return {
          id: doc.id,
          firebaseId: restaurantData.firebaseId,
          ...restaurantData,
          orders,
        };
      })
    );

    return res.json(restaurantsWithOrders);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to fetch restaurants with orders" });
  }
};


const getAllAdminOrders = async (req: Request, res: Response) => {
  try {
    // Use Query type, not CollectionReference
    let ordersQuery: firestore.Query<firestore.DocumentData> = db.collection("orders");

    if (req.query.restaurantId) {
      ordersQuery = ordersQuery.where(
        "restaurantId",
        "==",
        req.query.restaurantId as string
      );
    }

    const ordersSnapshot = await ordersQuery.get();
    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};
/**
 * ===============================
 * GET ALL DELIVERIES (ADMIN ONLY)
 * ===============================
 */
const getAllDeliveries = async (req: Request, res: Response) => {
  try {
    const adminRef = db.collection("admin").doc(req.firebaseId);
    const adminSnap = await adminRef.get();

    if (!adminSnap.exists || adminSnap.data()?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deliveriesSnap = await db.collection("delivery").get();
    const deliveries = deliveriesSnap.docs.map((doc) => ({
      deliveryId: doc.id,
      ...doc.data(),
    }));

    return res.json(deliveries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ===============================
 * UPDATE DELIVERY STATUS
 * ===============================
 */
const updateAdminDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Missing delivery status" });
    }

    const deliveryRef = db.collection("delivery").doc(deliveryId);
    const deliveryDoc = await deliveryRef.get();

    if (!deliveryDoc.exists) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    await deliveryRef.update({
      status,
      updatedAt: new Date(),
    });

    return res.json({ message: "Delivery status updated successfully!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to update delivery status" });
  }
};

/**
 * ===============================
 * IMAGE UPLOAD
 * ===============================
 */
const uploadImage = async (file: Express.Multer.File) => {
  const base64Image = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getAdminRestaurant,
  createAdminRestaurant,
  updateAdminRestaurant,
  updateAdminOrderStatus,
  getRestaurantsWithOrders,
  getAllDeliveries,
  updateAdminDeliveryStatus,
  getAllAdminOrders,
  getAllAdminRestaurant,
  getAdmin
};
