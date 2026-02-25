import express from "express";
import { firebaseAuth } from "../middleware/auth";
import { getMyDeliveries } from "../controllers/DeliveryOrderController";


const router = express.Router();

router.get("/", firebaseAuth, getMyDeliveries);

export default router;
