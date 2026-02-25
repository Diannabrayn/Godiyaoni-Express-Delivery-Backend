"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const firebase_1 = require("./config/firebase"); // ✅ Correctly importing Firebase
const MyUserRoute_1 = __importDefault(require("./routes/MyUserRoute"));
const cloudinary_1 = require("cloudinary");
const MyRestaurantRoute_1 = __importDefault(require("./routes/MyRestaurantRoute"));
const OrderRoute_1 = __importDefault(require("./routes/OrderRoute"));
const RestaurantRoutes_1 = __importDefault(require("./routes/RestaurantRoutes"));
const DeliveryRoute_1 = __importDefault(require("./routes/DeliveryRoute"));
const DeliveryOrderRoute_1 = __importDefault(require("./routes/DeliveryOrderRoute"));
const AdminRoute_1 = __importDefault(require("./routes/AdminRoute"));
// Cloudinary Configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // You can customize this if needed
// Health check route
app.get("/health", async (_req, res) => {
    res.send({ message: "Health check passed!" });
});
// Routes
app.use("/api/my/admin", AdminRoute_1.default);
app.use("/api/my/user", MyUserRoute_1.default);
app.use("/api/my/restaurant", MyRestaurantRoute_1.default);
app.use("/api/restaurant", RestaurantRoutes_1.default);
app.use("/api/order", OrderRoute_1.default);
app.use("/api/delivery", DeliveryRoute_1.default);
app.use("/api/delivery", DeliveryOrderRoute_1.default);
// Firestore Example Usage
const db = firebase_1.admin.firestore(); // ✅ Correct way to access Firestore
app.get("/test-firestore", async (_req, res) => {
    try {
        const snapshot = await db.collection("test").get();
        const docs = snapshot.docs.map((doc) => doc.data());
        res.json({ success: true, data: docs });
    }
    catch (error) {
        console.error("Firestore Error:", error);
        res.status(500).json({ success: false });
    }
});
// Start server
app.listen(8000, () => {
    console.log("🔥 Server started on http://localhost:8000");
});
// Export as a Firebase Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map