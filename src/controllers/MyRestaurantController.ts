

import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { admin } from "../config/firebase";
import crypto from "crypto";
import { firestore } from "firebase-admin";
import { Restaurant } from "../models/restaurant";
import { getDistanceMeters } from "../config/deliveryDistance";
import { calculateDeliveryPrice } from "../config/deliveryPrice";

const db = admin.firestore();

/* ============================
   GET MY RESTAURANT
============================ */
const getMyRestaurant = async (req: Request, res: Response) : Promise<void> => {
  try {
    const doc = await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .get();

    if (!doc.exists) {
      res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

/* ============================
   CREATE MY RESTAURANT
============================ */
const createMyRestaurant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      restaurantName,
      city,
      country,
      cuisines,
      menuItem,
      userAddress,
      address,
    } = req.body;

    if (!userAddress || !address) {
      res.status(400).json({ message: "Addresses required" });
      return;
    }

    const distanceMeters = await getDistanceMeters(
      userAddress,
      address
    );

    const deliveryType: "standard" = "standard";

    const deliveryPrice = calculateDeliveryPrice(
      distanceMeters,
      deliveryType
    );

    const deliveryTimeMinutes = Math.ceil(distanceMeters / 1000) * 5;

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const restaurantRef = db
      .collection("restaurant")
      .doc(req.firebaseId);

    const newRestaurant: Restaurant = {
      restaurantId: req.firebaseId,
      firebaseId: req.firebaseId,
      userId: req.firebaseId,

      restaurantName,
      restaurantNameLower: restaurantName.toLowerCase(),
      address,

      city,
      cityLower: city.toLowerCase(),
      country,

      deliveryTimeMinutes,
      deliveryPrice,
      

      cuisines: Array.isArray(cuisines) ? cuisines : [cuisines],
      cuisinesLower: Array.isArray(cuisines)
        ? cuisines.map((c: string) => c.toLowerCase())
        : [cuisines.toLowerCase()],

      menuItem: (menuItem || []).map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        nameLower: item.name.toLowerCase(),
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
      })),

      imageUrl,
      lastUpdated: firestore.Timestamp.now(),
    };

    await restaurantRef.set(newRestaurant);

    res.status(201).json(newRestaurant);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create restaurant" });
    return;
  }
};


/* ============================
   UPDATE MY RESTAURANT
============================ */
const updateMyRestaurant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ref = db.collection("restaurant").doc(req.firebaseId);
    const doc = await ref.get();

    if (!doc.exists) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    const existing = doc.data() as Restaurant;

    const updated: Partial<Restaurant> = {
      restaurantName: req.body.restaurantName,
      restaurantNameLower: req.body.restaurantName?.toLowerCase(),

      city: req.body.city,
      cityLower: req.body.city?.toLowerCase(),

      country: req.body.country,

      cuisines: req.body.cuisines,
      cuisinesLower: req.body.cuisines?.map((c: string) =>
        c.toLowerCase()
      ),

      menuItem: req.body.menuItem?.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        nameLower: item.name.toLowerCase(),
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
      })),

      lastUpdated: firestore.Timestamp.now(),
    };

    if (req.file) {
      updated.imageUrl = await uploadImage(req.file);
    }

    await ref.set({ ...existing, ...updated }, { merge: true });

    res.json({ ...existing, ...updated });
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to update restaurant" });
    return;
  }
};


/* ============================
   IMAGE UPLOAD
============================ */
const uploadImage = async (file: Express.Multer.File) => {
  const base64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64}`;
  const res = await cloudinary.uploader.upload(dataURI);
  return res.secure_url;
};

export default {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
};
