// import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { copyDocumentWithSubcollections } from "./scripts/copyFirestoreDocument";
// initializeApp();

// export const helloWorld = https.onRequest((_request, response) => {
//   response.send("Hello from Firebase!");
// });

export const copyFirestoreDocument = onRequest(async (req, res) => {
  try {
    const { fromPath, toPath } = req.body;

    if (!fromPath || !toPath) {
      res.status(400).send("Missing fromPath or toPath in request body");
      return;
    }

    await copyDocumentWithSubcollections(fromPath, toPath);
    res.status(200).send(`Copied from ${fromPath} to ${toPath}`);
  } catch (error: any) {
    console.error("Error copying document:", error);
    res.status(500).send(error.message || "Internal server error");
  }
});
