"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const DeliveryOrderController_1 = require("../controllers/DeliveryOrderController");
const router = express_1.default.Router();
router.get("/", auth_1.firebaseAuth, DeliveryOrderController_1.getDelivery);
exports.default = router;
//# sourceMappingURL=DeliveryOrderRoute.js.map