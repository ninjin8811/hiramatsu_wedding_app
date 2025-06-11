import * as admin from "firebase-admin";
import * as fs from "fs";
import { initializeAdminSdk } from "./initializeAdminSdk";

initializeAdminSdk();
const db = admin.firestore();

// ISO文字列 → Timestamp に変換（再帰的）
function convertISOToTimestamps(obj: any): any {
  if (
    typeof obj === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(obj)
  ) {
    const date = new Date(obj);
    if (!isNaN(date.getTime())) {
      return admin.firestore.Timestamp.fromDate(date);
    }
  }
  if (Array.isArray(obj)) {
    return obj.map(convertISOToTimestamps);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertISOToTimestamps(v)])
    );
  }
  return obj;
}

async function uploadDoc(_jsonFilePath: string) {
  // firestorePath は "users/userA" など
  const firestorePath = _jsonFilePath
    .replace(/^firestore-data\//, "")
    .replace(/\.json$/, "");

  // 実際のファイルパスは "firestore-data/users/userA.json" のように補完
  const filePath = "firestore-data/" + firestorePath + ".json";

  const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const data = convertISOToTimestamps(rawData);

  const docRef = db.doc(firestorePath);
  await docRef.set(data, { merge: true });

  console.log(`Uploaded to ${firestorePath}`);
}

// CLI例: ts=node scripts/upload users/userA.json
const [, , jsonFilePath] = process.argv;
uploadDoc(jsonFilePath);
