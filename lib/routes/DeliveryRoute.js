"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DeliveryController_1 = require("../controllers/DeliveryController");
const validation_1 = require("../middleware/validation");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
// Create a delivery with image + validation
router.post("/", auth_1.firebaseAuth, upload.single("image"), validation_1.validateDeliveryRequest, DeliveryController_1.createMyDelivery);
router.get("/:deliveryId", auth_1.firebaseAuth, DeliveryController_1.getDeliveryOrder);
router.post("/checkout/create-checkout-session/:deliveryId", auth_1.firebaseAuth, DeliveryController_1.createDeliveryCheckoutSession);
router.post("/paystack/webhook", DeliveryController_1.paystackDeliveryWebhookHandler);
exports.default = router;
//# sourceMappingURL=DeliveryRoute.js.map