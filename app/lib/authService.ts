import * as admin from "firebase-admin";
import { auth as adminAuth, firestore } from "./firebaseAdmin";
import { firebaseConfig } from "./firebaseConfig";
import {
  normalizePhoneNumber,
  normalizeUsername,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from "./validators";

const USERS_COLLECTION = "users";
const PATIENTS_COLLECTION = "patients";
const DOCTORS_COLLECTION = "doctors";
const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRES_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  usernameLower: string;
  phoneNumber: string;
  phoneNumberNormalized: string;
  email: string;
  role: string;
  createdAt: FirebaseFirestore.FieldValue;
}

export interface DoctorProfile extends UserProfile {
  specialization: string;
  availability: string[];
  hospital?: string;
  category?: string;
  status?: string;
  fee?: string;
  doctorCharges?: string;
  paymentRequired?: boolean;
}

export async function findUserByIdentifier(identifier: string) {
  const normalized = normalizeUsername(identifier);
  const phoneNormalized = normalizePhoneNumber(identifier);
  const collection = firestore.collection(USERS_COLLECTION);

  const usernameQuery = await collection
    .where("usernameLower", "==", normalized)
    .limit(1)
    .get();

  if (!usernameQuery.empty) {
    return usernameQuery.docs[0].data() as UserProfile;
  }

  const phoneQuery = await collection
    .where("phoneNumberNormalized", "==", phoneNormalized)
    .limit(1)
    .get();

  if (!phoneQuery.empty) {
    return phoneQuery.docs[0].data() as UserProfile;
  }

  return null;
}

export async function assertUsernameAndPhoneAreUnique(username: string, phoneNumber: string) {
  const usernameLower = normalizeUsername(username);
  const phoneNumberNormalized = normalizePhoneNumber(phoneNumber);
  const collection = firestore.collection(USERS_COLLECTION);

  const [usernameSnapshot, phoneSnapshot] = await Promise.all([
    collection.where("usernameLower", "==", usernameLower).limit(1).get(),
    collection.where("phoneNumberNormalized", "==", phoneNumberNormalized).limit(1).get(),
  ]);

  if (!usernameSnapshot.empty) {
    throw new Error("Username is already registered.");
  }

  if (!phoneSnapshot.empty) {
    throw new Error("Phone number is already registered.");
  }
}

function buildUserProfile(uid: string, payload: Omit<UserProfile, "uid" | "usernameLower" | "phoneNumberNormalized">): UserProfile {
  return {
    uid,
    fullName: payload.fullName,
    username: payload.username,
    usernameLower: normalizeUsername(payload.username),
    phoneNumber: payload.phoneNumber,
    phoneNumberNormalized: normalizePhoneNumber(payload.phoneNumber),
    email: payload.email,
    role: payload.role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  } as UserProfile;
}

function translateAdminAuthError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("configuration-not-found") ||
    message.includes("There is no configuration corresponding to the provided identifier") ||
    message.includes("CONFIGURATION_NOT_FOUND")
  ) {
    return new Error(
      "Firebase Authentication is not configured for this project. Open the Firebase Console for project smart-clinic-system-abb66, enable Authentication, and enable Email/Password sign-in."
    );
  }

  return new Error(message);
}

async function createUserDocument(profile: UserProfile) {
  const userRef = firestore.collection(USERS_COLLECTION).doc(profile.uid);
  await userRef.set(profile);
}

async function createPatientDocument(profile: UserProfile) {
  const patientRef = firestore.collection(PATIENTS_COLLECTION).doc(profile.uid);
  await patientRef.set(profile);
}

async function createDoctorDocument(profile: DoctorProfile) {
  const doctorRef = firestore.collection(DOCTORS_COLLECTION).doc(profile.uid);
  await doctorRef.set(profile);
}

export async function registerPatient(payload: {
  fullName: string;
  username?: string;
  phoneNumber: string;
  email?: string;
  password: string;
  confirmPassword: string;
}) {
  const { fullName, username, phoneNumber, email, password, confirmPassword } = payload;

  if (!fullName || !phoneNumber || !password || !confirmPassword) {
    throw new Error("Full name, phone number, and password are required for patient registration.");
  }

  if (password !== confirmPassword) {
    throw new Error("Password and confirm password do not match.");
  }

  if (!validatePhoneNumber(phoneNumber)) {
    throw new Error("Invalid phone number format.");
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const safeUsername = username?.trim() || `${fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${normalizedPhone.slice(-4)}`;
  const safeEmail = email?.trim() || `${normalizedPhone}@patients.smartclinic.test`;

  if (!validateEmail(safeEmail)) {
    throw new Error("Invalid email format.");
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters long.");
  }

  await assertUsernameAndPhoneAreUnique(safeUsername, phoneNumber);

  let createdUser;
  try {
    createdUser = await adminAuth.createUser({
      email: safeEmail,
      password,
      displayName: fullName,
    });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  try {
    await adminAuth.setCustomUserClaims(createdUser.uid, { role: "patient" });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  const profile = buildUserProfile(createdUser.uid, {
    fullName,
    username: safeUsername,
    phoneNumber,
    email: safeEmail,
    role: "patient",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await Promise.all([createUserDocument(profile), createPatientDocument(profile)]);

  return profile;
}

export async function registerDoctor(payload: {
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  specialization: string;
  hospital?: string;
  category?: string;
  password: string;
  confirmPassword: string;
  fee?: string;
  paymentRequired?: boolean;
}) {
  const { fullName, username, phoneNumber, email, specialization, hospital, category, password, confirmPassword } = payload;

  if (!fullName || !username || !phoneNumber || !email || !specialization || !hospital || !password || !confirmPassword) {
    throw new Error("All fields are required for doctor registration.");
  }

  if (password !== confirmPassword) {
    throw new Error("Password and confirm password do not match.");
  }

  if (!validateEmail(email)) {
    throw new Error("Invalid email format.");
  }

  if (!validatePhoneNumber(phoneNumber)) {
    throw new Error("Invalid phone number format.");
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters long.");
  }

  await assertUsernameAndPhoneAreUnique(username, phoneNumber);

  let createdUser;
  try {
    createdUser = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  try {
    await adminAuth.setCustomUserClaims(createdUser.uid, { role: "doctor" });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  const profile = buildUserProfile(createdUser.uid, {
    fullName,
    username,
    phoneNumber,
    email,
    role: "doctor",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }) as DoctorProfile;

  profile.specialization = specialization;
  profile.hospital = hospital;
  profile.category = category;
  profile.availability = [];
  profile.status = "Available";

  if (payload.fee && payload.fee !== "$0") {
    profile.fee = payload.fee;
    profile.doctorCharges = payload.fee;
  }

  profile.paymentRequired = Boolean(payload.paymentRequired);

  await Promise.all([createUserDocument(profile), createDoctorDocument(profile)]);

  return profile;
}

export async function createStaff(payload: {
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
}) {
  const { fullName, username, phoneNumber, email, password } = payload;

  if (!fullName || !username || !phoneNumber || !email || !password) {
    throw new Error("Full name, username, phone number, email, and password are required for staff creation.");
  }

  if (!validateEmail(email)) {
    throw new Error("Invalid email format.");
  }

  if (!validatePhoneNumber(phoneNumber)) {
    throw new Error("Invalid phone number format.");
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters long.");
  }

  await assertUsernameAndPhoneAreUnique(username, phoneNumber);

  let createdUser;
  try {
    createdUser = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  try {
    await adminAuth.setCustomUserClaims(createdUser.uid, { role: "staff" });
  } catch (error) {
    throw translateAdminAuthError(error);
  }

  const profile = buildUserProfile(createdUser.uid, {
    fullName,
    username,
    phoneNumber,
    email,
    role: "staff",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await createUserDocument(profile);

  return profile;
}

export async function signInUser(identifier: string, password: string, role?: string) {
  const normalizedIdentifier = identifier.toLowerCase();

  let userProfile = await findUserByIdentifier(identifier);

  // If not found by username or phone, allow email as identifier (common for system accounts)
  if (!userProfile && validateEmail(identifier)) {
    try {
      const byEmail = await adminAuth.getUserByEmail(identifier);
      const userDoc = await firestore.collection(USERS_COLLECTION).doc(byEmail.uid).get();
      if (userDoc.exists) userProfile = userDoc.data() as UserProfile;
    } catch (e) {
      // ignore and fall through to throw below
    }
  }

  if (!userProfile) {
    throw new Error("Invalid username, phone number, or email.");
  }

  if (role) {
    if (role !== userProfile.role) {
      throw new Error(
        "Selected role does not match the account details. Please use the correct login type."
      );
    }
  } else if (userProfile.role === "patient") {
    throw new Error("Patient accounts must login through the dedicated patient portal.");
  }

  let sessionCookie: string | undefined;
  try {
    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userProfile.email,
          password,
          returnSecureToken: true,
        }),
      }
    );

      if (!signInResponse.ok) {
        const body = await signInResponse.json().catch(() => null);
        const rawMessage = body?.error?.message || "Invalid credentials.";
        throw new Error(rawMessage);
      } else {
      const data = await signInResponse.json();
      const idToken = data.idToken;

      if (!idToken) {
        throw new Error("Authentication failed.");
      }

      try {
        sessionCookie = await adminAuth.createSessionCookie(idToken, {
          expiresIn: SESSION_EXPIRES_MS,
        });
      } catch (error) {
        throw translateAdminAuthError(error);
      }
    }
  } catch (err) {
    if (err instanceof Error && /(ENOTFOUND|EAI_AGAIN|ETIMEDOUT)/i.test(err.message)) {
      throw new Error("Unable to reach Firebase authentication service. Check your network connection and try again.");
    }
    throw err instanceof Error ? err : new Error(String(err));
  }

  return {
    sessionCookie,
    uid: userProfile.uid,
    role: userProfile.role,
    fullName: userProfile.fullName || "",
    redirectTo: getRedirectForRole(userProfile.role),
  };
}

export async function verifySessionCookie(sessionCookie: string) {
  return adminAuth.verifySessionCookie(sessionCookie, true);
}

export async function revokeSession(sessionCookie: string) {
  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
  return adminAuth.revokeRefreshTokens(decodedClaims.sub);
}

export async function getUserFromSession(sessionCookie: string) {
  const decodedClaims = await verifySessionCookie(sessionCookie);
  const userRecord = await adminAuth.getUser(decodedClaims.sub);
  const userDoc = await firestore.collection(USERS_COLLECTION).doc(userRecord.uid).get();

  if (!userDoc.exists) {
    throw new Error("User profile not found.");
  }

  const profile = userDoc.data() as UserProfile;
  if (profile?.role === "doctor") {
    const doctorDoc = await firestore.collection(DOCTORS_COLLECTION).doc(userRecord.uid).get();
    if (doctorDoc.exists) {
      return doctorDoc.data() as DoctorProfile;
    }
  }

  return profile;
}

export function getRedirectForRole(role: string): string | undefined {
  switch (role) {
    case "patient":
      return "/patient/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return undefined;
  }
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRES_MS };
