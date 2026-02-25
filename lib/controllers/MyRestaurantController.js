"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const firebase_1 = require("../config/firebase");
const crypto_1 = __importDefault(require("crypto"));
const firebase_admin_1 = require("firebase-admin");
// Initialize Firestore
const db = firebase_1.admin.firestore();
const getMyRestaurant = async (req, res) => {
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
        const restaurantData = restaurantDoc.data();
        res.json(restaurantData); // Return the typed restaurant data
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching the restaurant!" });
    }
};
const createMyRestaurant = async (req, res, next) => {
    try {
        const { restaurantName, city, country, deliveryPrice, estimatedDeliveryTime, cuisines, menuItem, } = req.body;
        // Upload image if file provided
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadImage(req.file);
        }
        // Generate Firestore doc ID
        const restaurantRef = db.collection("restaurant").doc();
        const newRestaurant = {
            restaurantId: restaurantRef.id,
            firebaseId: req.firebaseId, // user creating restaurant
            restaurantName,
            restaurantNameLower: restaurantName.toLowerCase(), // <-- add this
            city,
            cityLower: city.toLowerCase(), // <-- add this
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
const updateMyRestaurant = async (req, res) => {
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
        const updatedRestaurantData = restaurantDoc.data();
        const updatedRestaurant = Object.assign(Object.assign({}, updatedRestaurantData), { restaurantName: req.body.restaurantName, city: req.body.city, country: req.body.country, deliveryPrice: req.body.deliveryPrice, estimatedDeliveryTime: req.body.estimatedDeliveryTime, cuisines: req.body.cuisines, menuItem: req.body.menuItem.map((item) => ({
                id: item.id || crypto_1.default.randomUUID(),
                name: item.name,
                price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
            })), lastUpdated: firebase_admin_1.firestore.Timestamp.fromDate(new Date()) });
        if (req.file) {
            const imageUrl = await uploadImage(req.file);
            updatedRestaurant.imageUrl = imageUrl;
        }
        await db
            .collection("restaurant")
            .doc(req.firebaseId)
            .set(updatedRestaurant, { merge: true });
        res.status(200).send(updatedRestaurant);
    }
    catch (error) {
        console.log("Error", error);
        res
            .status(500)
            .json({ message: "Something went wrong updating the restaurant!" });
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
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
};
//# sourceMappingURL=MyRestaurantController.js.map