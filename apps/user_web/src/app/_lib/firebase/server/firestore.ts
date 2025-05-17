import { FirebaseServerAppSettings, initializeServerApp } from "@firebase/app";
import { firebaseConfig } from "../Config";
import { headers } from "next/headers";
import { getFirestore } from "firebase/firestore";


export const getServerApp = async () => {
  const settings: FirebaseServerAppSettings = {
    releaseOnDeref: await headers(),
  };
  return initializeServerApp(firebaseConfig, settings)
}

export const getServerDb = async () => {
  const app = await getServerApp();
  return getFirestore(app);
}