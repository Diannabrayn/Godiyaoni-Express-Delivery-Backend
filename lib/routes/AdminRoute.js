"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/AdminRoute.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const multer_1 = __importDefault(require("multer"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
router.post("/restaurant", auth_1.firebaseAuth, upload.single("imageFile"), validation_1.validateMyRestaurantrequest, AdminController_1.default.createAdminRestaurant);
router.put("/restaurant/:restaurantId", auth_1.firebaseAuth, upload.single("imageFile"), validation_1.validateMyRestaurantrequest, AdminController_1.default.updateAdminRestaurant);
router.get("/restaurant", auth_1.firebaseAuth, AdminController_1.default.getRestaurantsWithOrders);
router.get("/restaurant", auth_1.firebaseAuth, AdminController_1.default.getAdminRestaurant);
router.patch("/orders/:orderId/status", auth_1.firebaseAuth, AdminController_1.default.updateAdminOrderStatus);
router.get("/delivery", auth_1.firebaseAuth, AdminController_1.default.getAllDeliveries);
router.patch("/delivery/:deliveryId/status", auth_1.firebaseAuth, AdminController_1.default.updateAdminDeliveryStatus);
exports.default = router;
//# sourceMappingURL=AdminRoute.js.map