"use client";

import { ReactNode, useEffect } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const key = Buffer.from(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG_BASE64!,
  "base64"
).toString("utf8");
const FIREBASE_CONFIG = JSON.parse(key);

const firebaseConfig = {
  apiKey: FIREBASE_CONFIG.api_key,
  authDomain: FIREBASE_CONFIG.auth_domain,
  projectId: FIREBASE_CONFIG.project,
  storageBucket: FIREBASE_CONFIG.storage_bucket,
  messagingSenderId: FIREBASE_CONFIG.messaging_sender_id,
  appId: FIREBASE_CONFIG.web_app_id,
  measurementId: FIREBASE_CONFIG.measurement_id,
};

// Initialize Firebase App and export it
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export { app as firebaseApp }; // Export the initialized app as firebaseApp

type Props = {
  children: ReactNode;
};

export default function FirebaseInitializer(props: Props) {
  // Pass the explicitly initialized 'app' to Firebase services
  const auth = getAuth(app);
  const functions = getFunctions(app);
  const firestore = getFirestore(app);

  useEffect(() => {
    if (FIREBASE_CONFIG.measurement_id) getAnalytics(app);
    if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_VAPID_KEY) getMessaging(app);
  }, []);

  functions.region = "asia-northeast1";

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    console.log("Connecting to emulators");
    setupEmulators({ auth, functions, firestore });
  }

  return props.children;
}

async function setupEmulators({
  auth,
  functions,
  firestore,
}: {
  auth: ReturnType<typeof getAuth>;
  functions: ReturnType<typeof getFunctions>;
  firestore: ReturnType<typeof getFirestore>;
}) {
  const authUrl = "http://127.0.0.1:9099";
  try {
    connectAuthEmulator(auth, authUrl, {
      disableWarnings: true,
    });
    connectFunctionsEmulator(functions, "localhost", 5001);
    connectFirestoreEmulator(firestore, "localhost", 8080);
    console.log("Successfully connected to Firebase emulators.");
  } catch (e) {
    // Log specific error messages for better debugging
    if (e instanceof Error) {
        console.error(`Error connecting to Firebase emulators: ${e.message}`);
        if (e.message.includes("already been started")) {
            console.warn("Emulator connection warning: Services might have been started multiple times.");
        } else {
            // Optionally rethrow for critical errors not related to multiple starts
            // throw e;
        }
    } else {
        console.error("An unknown error occurred during emulator setup:", e);
    }
  }
}
