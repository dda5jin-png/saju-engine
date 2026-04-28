import admin from "firebase-admin";

type AdminApp = admin.app.App;

let cachedAdminApp: AdminApp | null = null;

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function assertAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  const missing = [
    !projectId && "FIREBASE_PROJECT_ID",
    !clientEmail && "FIREBASE_CLIENT_EMAIL",
    !privateKey && "FIREBASE_PRIVATE_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase Admin config: ${missing.join(", ")}`);
  }

  return { projectId, clientEmail, privateKey };
}

export function getAdminApp() {
  if (!cachedAdminApp) {
    cachedAdminApp =
      admin.apps.length > 0
        ? admin.app()
        : admin.initializeApp({
            credential: admin.credential.cert(assertAdminConfig()),
          });
  }

  return cachedAdminApp;
}

export function getAdminAuth() {
  return admin.auth(getAdminApp());
}

export function getAdminDb() {
  return admin.firestore(getAdminApp());
}

export function getAdminTimestamp() {
  return admin.firestore.Timestamp;
}

export function getAdminFieldValue() {
  return admin.firestore.FieldValue;
}
