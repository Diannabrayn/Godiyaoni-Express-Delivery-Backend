import * as admin from "firebase-admin";
import serviceAccountKey from "./serviceAccountKey.json";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccountKey as admin.ServiceAccount
    ),
  });
}

async function makeAdmin(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
}

const db = admin.firestore();

export { admin, db, makeAdmin };
