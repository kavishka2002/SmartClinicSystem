import * as admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import path from "path";

let adminAppInstance: admin.app.App | null = null;
let initError: Error | null = null;

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

  // Method 1b: Use a local service account JSON file path
  if (process.env.FIREBASE_ADMIN_CREDENTIALS_PATH) {
    const credentialsPath = path.isAbsolute(process.env.FIREBASE_ADMIN_CREDENTIALS_PATH)
      ? process.env.FIREBASE_ADMIN_CREDENTIALS_PATH
      : path.join(process.cwd(), process.env.FIREBASE_ADMIN_CREDENTIALS_PATH);

    try {
      const fileContents = readFileSync(credentialsPath, "utf8");
      const credentials = JSON.parse(fileContents);
      return admin.credential.cert(credentials);
    } catch (error) {
      throw new Error(
        `Failed to load FIREBASE_ADMIN_CREDENTIALS_PATH from ${credentialsPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Method 1c: Fallback to a local service account JSON file in the project root
  const localServiceAccountPath = path.join(process.cwd(), "firebase-admin-service-account.json");
  if (existsSync(localServiceAccountPath)) {
    try {
      const fileContents = readFileSync(localServiceAccountPath, "utf8");
      const credentials = JSON.parse(fileContents);
      return admin.credential.cert(credentials);
    } catch (error) {
      throw new Error(
        `Failed to load local Firebase service account JSON from ${localServiceAccountPath}: ${error instanceof Error ? error.message : String(error)}`
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
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    
    // Check if private key is just a placeholder
    if (privateKey.includes("...") || privateKey.includes("YOUR_")) {
      throw new Error(
        "Firebase private key appears to be a placeholder. Please set FIREBASE_PRIVATE_KEY with your actual private key from Firebase Console."
      );
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
      private_key: privateKey,
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
    // During build time, or without credentials, this will throw
    // We'll throw it again below in initializeAdmin where we can catch and handle it
    throw new Error(
      `Firebase Admin credentials not found. Please provide either:\n` +
      `1. FIREBASE_ADMIN_CREDENTIALS (JSON string), or\n` +
      `2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (individual variables)\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Initialize Firebase Admin only once, on first use (lazy initialization)
function initializeAdmin() {
  if (adminAppInstance) {
    return adminAppInstance;
  }

  if (initError) {
    throw initError;
  }

  try {
    if (admin.apps.length === 0) {
      const credential = getAdminCredential();

      adminAppInstance = admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      adminAppInstance = admin.app();
    }

    return adminAppInstance;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    throw initError;
  }
}

// Getter functions for direct access (recommended)
export function getAuth() {
  return initializeAdmin().auth();
}

export function getFirestore() {
  return initializeAdmin().firestore();
}

export function getAdminApp() {
  return initializeAdmin();
}

// For backward compatibility with existing imports that use { auth, firestore }
// Create Proxy objects that lazy-initialize on first property access
export const auth = new Proxy({} as any, {
  get: (_target, prop) => {
    try {
      const authInstance = getAuth();
      return authInstance[prop as keyof typeof authInstance];
    } catch (error) {
      console.error("Failed to get auth instance:", error);
      throw error;
    }
  },
});

export const firestore = new Proxy({} as any, {
  get: (_target, prop) => {
    try {
      const firestoreInstance = getFirestore();
      return firestoreInstance[prop as keyof typeof firestoreInstance];
    } catch (error) {
      console.error("Failed to get firestore instance:", error);
      throw error;
    }
  },
});

export const adminApp = new Proxy({} as any, {
  get: (_target, prop) => {
    try {
      const app = getAdminApp();
      return app[prop as keyof typeof app];
    } catch (error) {
      console.error("Failed to get admin app instance:", error);
      throw error;
    }
  },
});