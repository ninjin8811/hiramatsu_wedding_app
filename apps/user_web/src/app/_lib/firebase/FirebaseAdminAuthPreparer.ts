import { deleteCookie, setCookie } from "cookies-next";
import { AUTH_COOKIE_NAME } from "./FirebaseConfig";
import { env } from "process";

export function setAuthCookie(token: string) {
  setCookie(AUTH_COOKIE_NAME, token, {
    path: "/",
    sameSite: "lax",
    httpOnly: window.document.location.protocol === "https",
    secure: env.ENVIRONMENT === "production",
  });
}

export function deleteAuthCookie() {
  deleteCookie(AUTH_COOKIE_NAME);
}
