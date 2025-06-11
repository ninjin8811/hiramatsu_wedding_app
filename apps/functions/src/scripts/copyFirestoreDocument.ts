import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = admin.firestore();

/**
 * 指定されたドキュメントとそのサブコレクションを再帰的にコピー
 * @param {string} fromPath コピー元のパス
 * @param {string} toPath コピー先のパス
 */
export async function copyDocumentWithSubcollections(
  fromPath: string,
  toPath: string
): Promise<void> {
  const fromDocRef = db.doc(fromPath);
  const toDocRef = db.doc(toPath);

  const fromDocSnap = await fromDocRef.get();
  if (!fromDocSnap.exists) {
    throw new Error(`Document at path ${fromPath} does not exist`);
  }

  // ドキュメントのデータをコピー
  await toDocRef.set(fromDocSnap.data() || {});

  // サブコレクションを再帰的に処理
  const subcollections = await fromDocRef.listCollections();
  for (const subcol of subcollections) {
    const subcolSnap = await subcol.get();
    for (const doc of subcolSnap.docs) {
      const subFromPath = `${fromPath}/${subcol.id}/${doc.id}`;
      const subToPath = `${toPath}/${subcol.id}/${doc.id}`;
      await copyDocumentWithSubcollections(subFromPath, subToPath);
    }
  }
}

/**
 * HTTPS経由でコピーをトリガーする関数
 */
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
