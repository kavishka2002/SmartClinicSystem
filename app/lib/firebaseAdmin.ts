import * as admin from "firebase-admin";

let adminApp: admin.app.App;

function getAdminCredential() {
  // Method 1: Use environment-provided service account credentials as JSON string
  // This is the recommended method for Vercel and other cloud platforms
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
      return admin.credential.cert(credentials);
    } catch (error) {
      throw new Error(
        `Failed to parse FIREBASE_ADMIN_CREDENTIALS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Method 2: Use individual environment variables to construct service account
  // This is useful for Vercel environment variables (can't easily store multi-line JSON)
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    };

    try {
      return admin.credential.cert(serviceAccount as admin.ServiceAccount);
    } catch (error) {
      throw new Error(
        `Failed to initialize Firebase Admin with environment variables: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Fallback: Try to use Google Application Default Credentials
  // This works in some environments (like Google Cloud Run)
  try {
    return admin.credential.applicationDefault();
  } catch (error) {
    throw new Error(
      `Firebase Admin credentials not found. Please provide either:\n` +
      `1. FIREBASE_ADMIN_CREDENTIALS (JSON string), or\n` +
      `2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (individual variables)\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

if (!admin.apps.length) {
  try {
    const credential = getAdminCredential();

    adminApp = admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error(
      "Firebase Admin initialization failed:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
} else {
  adminApp = admin.app();
}

const auth = adminApp.auth();
const firestore = adminApp.firestore();

export { adminApp, auth, firestore };