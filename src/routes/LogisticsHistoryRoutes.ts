import express from "express";
import { firebaseAuth } from "../middleware/auth";
import { getMyPickUpDeliveries, getMyDoorToDoorDeliveries, getMyMotorParkDeliveries, getMyWayBillDeliveries } from "../controllers/LogisticsHistoryController";


const router = express.Router();

router.get("/", firebaseAuth, getMyPickUpDeliveries);

router.get("/", firebaseAuth, getMyDoorToDoorDeliveries);

router.get("/", firebaseAuth, getMyMotorParkDeliveries);

router.get("/", firebaseAuth, getMyWayBillDeliveries);

export default router;
