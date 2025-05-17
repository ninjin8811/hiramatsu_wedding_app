"use client";

import { ReactNode, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
import { FIREBASE_CONFIG, firebaseConfig } from "./Config";

type Props = {
  children: ReactNode;
};

export default function FirebaseInitializer(props: Props) {
  try {
    initializeApp(firebaseConfig);
  } catch (e) {
    if (
      e instanceof Error &&
      !e.message.includes("Firestore has already been started")
    ) {
      throw new Error(e.message + "a");
    }
  }

  const auth = getAuth();
  const functions = getFunctions();
  const firestore = getFirestore();
  useEffect(() => {
    if (FIREBASE_CONFIG.measurement_id) getAnalytics();
    if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_VAPID_KEY) getMessaging();
  }, []);

  functions.region = "asia-northeast1";

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    console.log("emulators");
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
  // Firebase: Error (auth/emulator-config-failed). を避けるため、事前にauthUrlをfetchしておく
  // https://dev.to/ilumin/fix-firebase-error-authemulator-config-failed-mng
  const authUrl = "http://127.0.0.1:9099";
  // ERRORが出ていたため一旦コメントアウト
  // await fetch(authUrl);
  try {
    connectAuthEmulator(auth, authUrl, {
      disableWarnings: true,
    });
    connectFunctionsEmulator(functions, "localhost", 5001);
    connectFirestoreEmulator(firestore, "localhost", 8080);
  } catch (e) {
    if (
      e instanceof Error &&
      !e.message.includes("Firestore has already been started")
    ) {
      throw new Error(e.message);
    }
  }
}
