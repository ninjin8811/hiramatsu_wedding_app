import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { initializeAdminSdk } from "./initializeAdminSdk";

initializeAdminSdk();
const db = admin.firestore();

function convertTimestampsToISO(obj: any): any {
  if (obj instanceof admin.firestore.Timestamp) {
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertTimestampsToISO);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertTimestampsToISO(v)])
    );
  }
  return obj;
}

async function downloadDoc(firestorePath: string, outputDir: string) {
  const docRef = db.doc(firestorePath);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    console.error(`Document not found: ${firestorePath}`);
    return;
  }

  const data = convertTimestampsToISO(docSnap.data());
  const filename = `${firestorePath}.json`;
  const fullPath = path.join(outputDir, filename);

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  console.log(`Saved to ${fullPath}`);
}

// CLI例: ts-node scripts/download users/userA firestore-data
const [, , firestorePath, outputDir = "firestore-data"] = process.argv;
downloadDoc(firestorePath, outputDir);
