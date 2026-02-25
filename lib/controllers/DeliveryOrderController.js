"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelivery = void 0;
const firebase_1 = require("../config/firebase");
const getDelivery = async (req, res) => {
    try {
        const snapshot = await firebase_1.db
            .collection("delivery")
            .where("firebaseId", "==", req.firebaseId)
            .get();
        const delivery = snapshot.docs.map((doc) => {
            const deliveryData = doc.data();
            return Object.assign({ deliveryId: doc.id }, deliveryData);
        });
        res.json(delivery);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.getDelivery = getDelivery;
//# sourceMappingURL=DeliveryOrderController.js.map