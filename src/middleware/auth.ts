import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";


declare global {
  namespace Express {
    interface Request {
      firebaseId: string;
      email?: string;
    }
  }
}

const firebaseAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const idtoken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idtoken);

    // Attach firebaseId and email to request object
    req.firebaseId = decodedToken.uid;
    req.email = decodedToken.email || undefined;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};

import { db } from "../config/firebase";

export const requireSuperAdmin = async (req: Request, res: Response) => {
  try {
    
    const firebaseId = (req as any).firebaseId;
    const adminDoc = await db.collection("admin").doc(firebaseId).get();

    if (!adminDoc.exists) {
       res.status(403).json({ message: "Not an admin" });
       return; 
    }

    const adminData = adminDoc.data();
    if (adminData?.role !== "super-admin") {
      res.status(403).json({ message: "Super admin only" });
      return;
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authorization failed" });
  }
};

export  { firebaseAuth };