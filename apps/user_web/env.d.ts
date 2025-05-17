declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT: string;
      ADMIN_SDK_SERVICE_ACCOUNT_KEY_BASE64: string;
      NEXT_PUBLIC_FIREBASE_CONFIG_BASE64: string;
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR?: string;
      FIREBASE_AUTH_EMULATOR_HOST?: string;
      FIRESTORE_EMULATOR_HOST?: string;
    }
  }
}

export {};
