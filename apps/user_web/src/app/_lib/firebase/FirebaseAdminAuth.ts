import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./FirebaseConfig";
import { getAuth } from "firebase-admin/auth";
import { initializeAdminSdk } from "./FirebaseAdminInitializer";

initializeAdminSdk();

export async function getServerAuthUser() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const decodedToken = await getAuth().verifyIdToken(token);
  return {
    uid: decodedToken.uid,
    displayName: decodedToken.name,
    email: decodedToken.email,
    photoURL: decodedToken.picture,
  };
}
