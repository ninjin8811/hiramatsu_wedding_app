"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as AuthUser,
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInAnonymously,
  linkWithPopup,
} from "firebase/auth";
import { deleteAuthCookie, setAuthCookie } from "./FirebaseAdminAuthPreparer";

type SupportProvider = "google" | "github";
type AuthChangeOption = {
  reload?: boolean;
};
interface AuthContextType {
  isInitialized: boolean;
  authUser: AuthUser | null;
  signUp: () => Promise<void>;
  signIn: () => Promise<void>;
  login: (
    provider: SupportProvider,
    options?: AuthChangeOption
  ) => Promise<void>;
  logout: (options?: AuthChangeOption) => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isInitialized: false,
  authUser: null,
  signUp: async () => {},
  signIn: async () => {},
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface Props {
  children: ReactNode;
  loginComponent: ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        deleteAuthCookie();
        await signInAnonymously(getAuth());
      } else {
        setAuthUser({
          ...user,
          displayName: user.displayName ?? user.providerData[0]?.displayName,
          photoURL: user.photoURL ?? user.providerData[0]?.photoURL,
        });
        console.log("User signed in:", user);
        setAuthCookie(await user.getIdToken());
        setIsInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setAuthUser(auth.currentUser);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();

      await linkWithPopup(auth.currentUser, provider).catch(async (error) => {
        console.log("Error upgrading anonymous account", error);
        window.alert("このメールアドレスは既に使用されています。");
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getAuth(), provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const login = async (
    provider: SupportProvider,
    options?: AuthChangeOption
  ) => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setAuthUser(auth.currentUser);
      return;
    }

    try {
      if (provider === "google") {
        const provider = new GoogleAuthProvider();

        await linkWithPopup(auth.currentUser, provider)
          .then(() => {
            console.log("Anonymous account successfully upgraded");
            if (options?.reload) window.location.reload();
          })
          .catch(async (error) => {
            console.log("Error upgrading anonymous account", error);
            setTimeout(async () => {
              const isConfirmed = window.confirm(
                "This email is already in use.\nDo you want to sign in with this account?\nYour answers created as guest will be lost."
              );
              if (!isConfirmed) return;
              await signInWithPopup(auth, provider);
              if (options?.reload) window.location.reload();
            }, 200);
          });
      } else if (provider === "github") {
        await signInWithPopup(auth, new GithubAuthProvider());
        if (options?.reload) window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async (options?: AuthChangeOption) => {
    const auth = getAuth();
    try {
      await signOut(auth);
      if (options?.reload) window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isInitialized) return <></>;

  return (
    <AuthContext.Provider
      value={{ isInitialized, authUser, login, logout, signIn, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
