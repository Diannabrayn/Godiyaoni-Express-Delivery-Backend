import express from "express";
import { firebaseAuth } from "../middleware/auth";
import { getDelivery } from "../controllers/DeliveryOrderController";


const router = express.Router();

router.get("/", firebaseAuth, getDelivery);

export default router;
