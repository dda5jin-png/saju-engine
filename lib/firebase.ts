import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

type FirebaseApp = ReturnType<typeof initializeApp>;
type FirestoreDb = ReturnType<typeof getFirestore>;

let cachedApp: FirebaseApp | null = null;
let cachedDb: FirestoreDb | null = null;

function assertFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(", ")}`);
  }

  return config;
}

export function getFirebaseApp() {
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(assertFirebaseConfig());
  }

  return cachedApp;
}

export function getDb() {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }

  return cachedDb;
}
