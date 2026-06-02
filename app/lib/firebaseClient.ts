import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const clientApp = initializeApp(firebaseConfig);
const auth = getAuth(clientApp);
const db = getFirestore(clientApp);

export { clientApp, auth, db, firebaseConfig };