import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { firebaseConfig } from "./firebaseConfig";

let adminApp: admin.app.App;

function getAdminCredential() {
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS));
  }

  const credentialsPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    const resolvedPath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.resolve(process.cwd(), credentialsPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Firebase admin credential file not found at ${resolvedPath}. Please set FIREBASE_ADMIN_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS to a valid service account JSON path.`
      );
    }

    const credentialsJson = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    return admin.credential.cert(credentialsJson);
  }

  const defaultLocalPath = path.resolve(process.cwd(), "firebase-admin-service-account.json");
  if (fs.existsSync(defaultLocalPath)) {
    const credentialsJson = JSON.parse(fs.readFileSync(defaultLocalPath, "utf8"));
    return admin.credential.cert(credentialsJson);
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  const credential = getAdminCredential();

  try {
    adminApp = admin.initializeApp({
      credential,
      projectId: firebaseConfig.projectId,
    });
  } catch (error) {
    throw new Error(
      `Firebase Admin initialization failed. Make sure FIREBASE_ADMIN_CREDENTIALS, FIREBASE_ADMIN_CREDENTIALS_PATH, or GOOGLE_APPLICATION_CREDENTIALS is configured correctly. Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} else {
  adminApp = admin.app();
}

const auth = adminApp.auth();
const firestore = adminApp.firestore();

export { adminApp, auth, firestore };