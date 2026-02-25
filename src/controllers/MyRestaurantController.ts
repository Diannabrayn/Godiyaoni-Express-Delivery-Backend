import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { admin } from "../config/firebase";
import crypto from "crypto";
import { firestore } from "firebase-admin";
import { Restaurant } from "../models/restaurant";

// Initialize Firestore
const db = admin.firestore();

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantDoc = await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .get();

    if (!restaurantDoc.exists) {
      res.status(404).json({ message: "Restaurant not found!" });
      return;
    }

    // Explicitly cast the Firestore document data to the Restaurant type
    const restaurantData = restaurantDoc.data() as Restaurant;

    res.json(restaurantData); // Return the typed restaurant data
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching the restaurant!" });
  }
};

const createMyRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    try {
    const {
      restaurantName,
      city,
      country,
      deliveryPrice,
      estimatedDeliveryTime,
      cuisines,
      menuItem,
    } = req.body;

    // Upload image if file provided
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file as Express.Multer.File);
    }

    // Generate Firestore doc ID
    const restaurantRef = db.collection("restaurant").doc();

   const newRestaurant: Restaurant = {
     restaurantId: restaurantRef.id,
     firebaseId: req.firebaseId, // user creating restaurant
     restaurantName,
     restaurantNameLower: restaurantName.toLowerCase(), // <-- add this
     city,
     cityLower: city.toLowerCase(), // <-- add this
     country,
     deliveryPrice: Number(deliveryPrice),
     estimatedDeliveryTime: Number(estimatedDeliveryTime),
     cuisines: Array.isArray(cuisines) ? cuisines : [cuisines],
     menuItem: (menuItem || []).map((item: any) => ({
       ...item,
       id: item.id || crypto.randomUUID(),
     })),
     imageUrl,
     lastUpdated: firestore.Timestamp.fromDate(new Date()),
     User: req.firebaseId,
   };


    await restaurantRef.set(newRestaurant);
    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res
      .status(500)
      .json({ message: "Something went wrong creating your restaurant!" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantDoc = await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .get();

    if (!restaurantDoc.exists) {
      res.status(404).json({ message: "Restaurant not found!" });
      return;
    }

    // Explicitly cast the Firestore document data to the Restaurant type
    const updatedRestaurantData = restaurantDoc.data() as Restaurant;

    const updatedRestaurant: Restaurant = {
      ...updatedRestaurantData,
      restaurantName: req.body.restaurantName,
      city: req.body.city,
      country: req.body.country,
      deliveryPrice: req.body.deliveryPrice,
      estimatedDeliveryTime: req.body.estimatedDeliveryTime,
      cuisines: req.body.cuisines,
      menuItem: req.body.menuItem.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        price:
          typeof item.price === "string" ? parseFloat(item.price) : item.price,
      })),

      lastUpdated: firestore.Timestamp.fromDate(new Date()),
    };

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      updatedRestaurant.imageUrl = imageUrl;
    }

    await db
      .collection("restaurant")
      .doc(req.firebaseId)
      .set(updatedRestaurant, { merge: true });

    res.status(200).send(updatedRestaurant);
  } catch (error) {
    console.log("Error", error);
    res
      .status(500)
      .json({ message: "Something went wrong updating the restaurant!" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
};
