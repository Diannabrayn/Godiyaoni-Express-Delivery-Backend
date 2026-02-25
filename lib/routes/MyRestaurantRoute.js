"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const MyRestaurantController_1 = __importDefault(require("../controllers/MyRestaurantController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
router.get("/", auth_1.firebaseAuth, MyRestaurantController_1.default.getMyRestaurant);
router.post("/", auth_1.firebaseAuth, upload.single("imageFile"), validation_1.validateMyRestaurantrequest, MyRestaurantController_1.default.createMyRestaurant);
router.put("/", auth_1.firebaseAuth, upload.single("imageFile"), validation_1.validateMyRestaurantrequest, MyRestaurantController_1.default.updateMyRestaurant);
exports.default = router;
//# sourceMappingURL=MyRestaurantRoute.js.map