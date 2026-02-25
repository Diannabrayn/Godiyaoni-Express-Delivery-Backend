"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackDeliveryWebhookHandler = exports.getDeliveryOrder = exports.createDeliveryCheckoutSession = exports.createMyDelivery = void 0;
const firebase_admin_1 = require("firebase-admin");
const cloudinary_1 = require("cloudinary");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const firebase_1 = require("../config/firebase");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const db = firebase_1.admin.firestore();
const uploadImage = async (file) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary_1.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};
// Create delivery
const createMyDelivery = async (req, res, next) => {
    var _a, _b;
    try {
        const imageUrl = await uploadImage(req.file);
        const newDelivery = {
            firebaseId: req.firebaseId,
            sender: {
                name: req.body["sender.name"],
                phone: req.body["sender.phone"],
                pickupAddress: req.body["pickupAddress"],
            },
            receiver: {
                name: req.body["receiver.name"],
                phone: req.body["receiver.phone"],
                dropoffAddress: req.body["dropoffAddress"],
            },
            package: {
                description: req.body["package.description"],
                weight: Number(req.body["package.weight"]),
                value: Number(req.body["package.value"]),
            },
            deliveryType: req.body["deliveryType"],
            price: Number((_a = req.body["price"]) !== null && _a !== void 0 ? _a : 1500),
            estimatedDeliveryTime: Number((_b = req.body["estimatedDeliveryTime"]) !== null && _b !== void 0 ? _b : 30),
            status: "placed",
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
            paymentReference: req.body["paymentReference"] || "",
            imageUrl,
            lastUpdated: firebase_admin_1.firestore.Timestamp.fromDate(new Date()),
            deliveryId: "", // will be set after creation
        };
        // Create doc in Firestore
        const docRef = await db.collection("delivery").add(newDelivery);
        // Update doc with its own ID
        await docRef.update({ deliveryId: docRef.id });
        res.status(201).json(Object.assign(Object.assign({}, newDelivery), { deliveryId: docRef.id }));
    }
    catch (error) {
        console.error("Create delivery failed:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.createMyDelivery = createMyDelivery;
const createDeliveryCheckoutSession = async (req, res) => {
    var _a, _b;
    try {
        const { deliveryId } = req.params;
        if (!deliveryId) {
            res.status(400).json({ message: "Missing deliveryId" });
            return;
        }
        const deliverySnap = await db.collection("delivery").doc(deliveryId).get();
        if (!deliverySnap.exists) {
            res.status(404).json({ message: "Delivery not found" });
            return;
        }
        const deliveryData = deliverySnap.data();
        if (!deliveryData) {
            res.status(404).json({ message: "Delivery data missing" });
            return;
        }
        // ✅ Create Paystack transaction
        const response = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email: ((_a = deliveryData.sender) === null || _a === void 0 ? void 0 : _a.email) || "test@fake.com", // Must provide valid email
            amount: Math.round(Number(deliveryData.price) * 100), // Paystack requires amount in kobo
            reference: `DELIVERY_${deliveryId}_${Date.now()}`,
            callback_url: `${FRONTEND_URL}/delivery-status?deliveryId=${deliveryId}`,
            metadata: {
                deliveryId,
                firebaseId: deliveryData.firebaseId,
                sender: deliveryData.sender,
                receiver: deliveryData.receiver,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        res.json({ url: response.data.data.authorization_url });
    }
    catch (error) {
        console.error("Paystack error:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
exports.createDeliveryCheckoutSession = createDeliveryCheckoutSession;
const getDeliveryOrder = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const docRef = db.collection("delivery").doc(deliveryId);
        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).json({ message: "Delivery not found" });
            return;
        }
        res.json(Object.assign({ deliveryId: doc.id }, doc.data()));
    }
    catch (error) {
        console.error("Error fetching delivery:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getDeliveryOrder = getDeliveryOrder;
const paystackDeliveryWebhookHandler = async (req, res) => {
    var _a;
    try {
        const signature = req.headers["x-paystack-signature"];
        const hash = crypto_1.default
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== signature) {
            res.status(401).send("Invalid signature");
        }
        const event = req.body;
        if (event.event === "charge.success") {
            const deliveryId = (_a = event.data.metadata) === null || _a === void 0 ? void 0 : _a.deliveryId;
            const reference = event.data.reference;
            if (deliveryId) {
                const docRef = db.collection("delivery").doc(deliveryId);
                const docSnap = await docRef.get();
                if (!docSnap.exists) {
                }
                else {
                    await docRef.update({
                        status: "paid",
                        paymentReference: reference,
                        lastUpdated: firebase_admin_1.firestore.Timestamp.now(),
                    });
                }
            }
        }
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
    }
};
exports.paystackDeliveryWebhookHandler = paystackDeliveryWebhookHandler;
//# sourceMappingURL=DeliveryController.js.map