import { initializeApp } from "firebase-admin/app";
import https from "firebase-functions/v2/https";

initializeApp();

export const helloWorld = https.onRequest((_request, response) => {
  response.send("Hello from Firebase!");
});
