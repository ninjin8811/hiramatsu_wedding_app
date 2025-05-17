const key = Buffer.from(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG_BASE64,
  "base64"
).toString("utf8");
export const FIREBASE_CONFIG = JSON.parse(key);

export const firebaseConfig = {
  apiKey: FIREBASE_CONFIG.api_key,
  authDomain: FIREBASE_CONFIG.auth_domain,
  projectId: FIREBASE_CONFIG.project,
  storageBucket: FIREBASE_CONFIG.storage_bucket,
  messagingSenderId: FIREBASE_CONFIG.messaging_sender_id,
  appId: FIREBASE_CONFIG.web_app_id,
  measurementId: FIREBASE_CONFIG.measurement_id,
};