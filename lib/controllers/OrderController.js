"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const firebase_1 = require("../config/firebase");
const firebase_admin_1 = require("firebase-admin");
const axios_1 = __importDefault(require("axios"));
const FRONTEND_URL = process.env.FRONTEND_URL;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const getMyOrders = async (req, res) => {
    try {
        const snapshot = await firebase_1.db
            .collection("orders")
            .where("userId", "==", req.firebaseId)
            .get();
        const orders = snapshot.docs.map((doc) => {
            const orderData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, orderData), { restaurant: orderData.restaurant || {
                    restaurantName: "Unknown Restaurant",
                    imageUrl: "/placeholder.png",
                    estimatedDeliveryTime: 0,
                } });
        });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
// ✅ Paystack Webhook Handler
const paystackOrderWebhookHandler = async (req, res) => {
    try {
        const secret = PAYSTACK_SECRET_KEY;
        // ✅ Use raw buffer directly for HMAC
        const hash = crypto_1.default
            .createHmac("sha512", secret)
            .update(req.body) // req.body is already Buffer because of express.raw
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            console.error("❌ Invalid Paystack signature");
            res.status(401).send("Invalid signature");
            return;
        }
        // ✅ Now parse after verification
        const event = JSON.parse(req.body.toString("utf8"));
        console.log("🚀 Paystack Webhook Event:", event);
        if (event.event === "charge.success") {
            const metadata = event.data.metadata;
            const orderId = metadata === null || metadata === void 0 ? void 0 : metadata.orderId;
            if (orderId) {
                await firebase_1.db
                    .collection("orders")
                    .doc(orderId)
                    .update({
                    status: "paid",
                    totalAmount: event.data.amount / 100,
                    paymentReference: event.data.reference,
                    paidAt: firebase_admin_1.firestore.Timestamp.now(),
                });
                console.log(`✅ Order ${orderId} marked as PAID`);
            }
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error("Webhook Error:", error);
        res.sendStatus(500);
    }
};
const createCheckoutSession = async (req, res) => {
    var _a;
    try {
        const { cartItems, deliveryDetails, restaurantId } = req.body;
        if (!restaurantId) {
            throw new Error("Restaurant ID is required");
        }
        // ✅ Fetch restaurant by its doc ID
        const restaurantRef = firebase_1.db.collection("restaurant").doc(restaurantId);
        const restaurantSnap = await restaurantRef.get();
        if (!restaurantSnap.exists) {
            throw new Error("Restaurant not found");
        }
        const restaurant = restaurantSnap.data();
        // ✅ Calculate total amount (items + delivery fee)
        const totalAmount = cartItems.reduce((sum, item) => {
            const menuItem = restaurant.menuItem.find((m) => m.id === item.menuItemId);
            return (sum + (menuItem ? Number(menuItem.price) * Number(item.quantity) : 0));
        }, 0) + (restaurant.deliveryPrice || 0);
        // ✅ Create a new Firestore order
        const orderDocRef = firebase_1.db.collection("orders").doc();
        const newOrder = {
            id: orderDocRef.id,
            restaurantId,
            restaurant,
            userId: req.firebaseId, // comes from auth middleware
            status: "placed",
            deliveryDetails,
            cartItems,
            totalAmount,
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
        };
        await orderDocRef.set(newOrder);
        // ✅ Initialize Paystack payment
        const response = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
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
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        res.json({ url: response.data.data.authorization_url });
    }
    catch (error) {
        console.error("Paystack error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ message: error.message });
    }
};
exports.default = {
    getMyOrders,
    createCheckoutSession,
    paystackOrderWebhookHandler,
};
//# sourceMappingURL=OrderController.js.map