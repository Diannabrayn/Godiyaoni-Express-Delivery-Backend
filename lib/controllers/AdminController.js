"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const firebase_admin_1 = require("firebase-admin");
const cloudinary_1 = require("cloudinary");
const crypto_1 = __importDefault(require("crypto"));
const getAdminRestaurant = async (req, res) => {
    try {
        const restaurantDoc = await firebase_1.db
            .collection("restaurant")
            .doc(req.firebaseId)
            .get();
        if (!restaurantDoc.exists) {
            res.status(404).json({ message: "Restaurant not found!" });
            return;
        }
        // Explicitly cast the Firestore document data to the Restaurant type
        const restaurantData = restaurantDoc.data();
        res.json(restaurantData); // Return the typed restaurant data
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching the restaurant!" });
    }
};
// ---------------- CREATE ADMIN RESTAURANT ----------------
const createAdminRestaurant = async (req, res) => {
    try {
        const { restaurantName, city, country, deliveryPrice, estimatedDeliveryTime, cuisines, menuItem, } = req.body;
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadImage(req.file);
        }
        const restaurantRef = firebase_1.db.collection("restaurant").doc();
        const newRestaurant = {
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
            menuItem: (menuItem || []).map((item) => (Object.assign(Object.assign({}, item), { id: item.id || crypto_1.default.randomUUID() }))),
            imageUrl,
            lastUpdated: firebase_admin_1.firestore.Timestamp.fromDate(new Date()),
            User: req.firebaseId,
        };
        await restaurantRef.set(newRestaurant);
        res.status(201).json(newRestaurant);
    }
    catch (error) {
        console.error("Error creating restaurant:", error);
        res
            .status(500)
            .json({ message: "Something went wrong creating your restaurant!" });
    }
};
// ---------------- UPDATE ADMIN RESTAURANT ----------------
// ---------------- UPDATE ADMIN RESTAURANT ----------------
const updateAdminRestaurant = async (req, res) => {
    var _a, _b, _c;
    try {
        const { restaurantId } = req.params;
        const restaurantDoc = await firebase_1.db
            .collection("restaurant")
            .doc(restaurantId)
            .get();
        if (!restaurantDoc.exists) {
            res.status(404).json({ message: "Restaurant not found!" });
            return;
        }
        const existingRestaurant = restaurantDoc.data();
        const updatedRestaurant = Object.assign(Object.assign({}, existingRestaurant), { restaurantName: (_a = req.body.restaurantName) !== null && _a !== void 0 ? _a : existingRestaurant.restaurantName, restaurantNameLower: req.body.restaurantName
                ? req.body.restaurantName.toLowerCase()
                : existingRestaurant.restaurantNameLower, city: (_b = req.body.city) !== null && _b !== void 0 ? _b : existingRestaurant.city, cityLower: req.body.city
                ? req.body.city.toLowerCase()
                : existingRestaurant.cityLower, country: (_c = req.body.country) !== null && _c !== void 0 ? _c : existingRestaurant.country, deliveryPrice: req.body.deliveryPrice
                ? Number(req.body.deliveryPrice)
                : existingRestaurant.deliveryPrice, estimatedDeliveryTime: req.body.estimatedDeliveryTime
                ? Number(req.body.estimatedDeliveryTime)
                : existingRestaurant.estimatedDeliveryTime, cuisines: req.body.cuisines
                ? Array.isArray(req.body.cuisines)
                    ? req.body.cuisines
                    : [req.body.cuisines]
                : existingRestaurant.cuisines, menuItem: req.body.menuItem
                ? req.body.menuItem.map((item) => ({
                    id: item.id || crypto_1.default.randomUUID(),
                    name: item.name,
                    price: typeof item.price === "string"
                        ? parseFloat(item.price)
                        : item.price,
                }))
                : existingRestaurant.menuItem, lastUpdated: firebase_admin_1.firestore.Timestamp.fromDate(new Date()), imageUrl: existingRestaurant.imageUrl, User: existingRestaurant.User, firebaseId: existingRestaurant.firebaseId, restaurantId: existingRestaurant.restaurantId });
        if (req.file) {
            const imageUrl = await uploadImage(req.file);
            updatedRestaurant.imageUrl = imageUrl;
        }
        await firebase_1.db
            .collection("restaurant")
            .doc(restaurantId)
            .set(updatedRestaurant, { merge: true });
        res.status(200).json(updatedRestaurant);
    }
    catch (error) {
        console.error("Error updating restaurant:", error);
        res
            .status(500)
            .json({ message: "Something went wrong updating the restaurant!" });
    }
};
// ---------------- UPDATE ORDER STATUS ----------------
const updateAdminOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ message: "Missing order status" });
            return;
        }
        const orderRef = firebase_1.db.collection("orders").doc(orderId);
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
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
// ---------------- GET ALL RESTAURANTS WITH ORDERS ----------------
const getRestaurantsWithOrders = async (req, res) => {
    try {
        const restaurantsSnapshot = await firebase_1.db.collection("restaurant").get();
        const restaurantsWithOrders = await Promise.all(restaurantsSnapshot.docs.map(async (doc) => {
            const restaurantData = doc.data();
            // ✅ Include both the document ID and the firebaseId (creator ID)
            const restaurant = Object.assign({ id: doc.id, firebaseId: restaurantData.firebaseId }, restaurantData);
            // ✅ Fetch orders belonging to this restaurant
            const ordersSnapshot = await firebase_1.db
                .collection("orders")
                .where("restaurantId", "==", doc.id)
                .get();
            const orders = ordersSnapshot.docs.map((orderDoc) => (Object.assign({ id: orderDoc.id }, orderDoc.data())));
            return Object.assign(Object.assign({}, restaurant), { orders });
        }));
        res.json(restaurantsWithOrders);
    }
    catch (error) {
        console.error("Error fetching restaurants with orders:", error);
        res.status(500).json({ error: "Failed to fetch restaurants with orders" });
    }
};
const getAllDeliveries = async (req, res) => {
    var _a;
    try {
        // ✅ Check if user is super admin
        const userRef = firebase_1.db.collection("admin").doc(req.firebaseId);
        const userSnap = await userRef.get();
        if (!userSnap.exists || ((_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        // ✅ Fetch all deliveries
        const deliveriesSnap = await firebase_1.db.collection("delivery").get();
        const deliveries = deliveriesSnap.docs.map((doc) => (Object.assign({ deliveryId: doc.id }, doc.data())));
        res.json(deliveries);
    }
    catch (error) {
        console.error("Error fetching all deliveries:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateAdminDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ message: "Missing delivery status" });
            return;
        }
        const deliveryRef = firebase_1.db.collection("delivery").doc(deliveryId);
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
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
const uploadImage = async (file) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary_1.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};
exports.default = {
    getAdminRestaurant,
    updateAdminDeliveryStatus,
    getAllDeliveries,
    getRestaurantsWithOrders,
    updateAdminOrderStatus,
    updateAdminRestaurant,
    createAdminRestaurant,
};
//# sourceMappingURL=AdminController.js.map