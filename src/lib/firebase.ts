import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
};

export const firebaseEnabled =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function getApp() {
  if (!_app && firebaseEnabled) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  if (!_auth && firebaseEnabled) {
    const app = getApp();
    if (app) {
      _auth = getAuth(app);
      _googleProvider = new GoogleAuthProvider();
    }
  }
  return _auth;
}

export function getGoogleProvider(): GoogleAuthProvider | null {
  if (!_googleProvider && firebaseEnabled) {
    getFirebaseAuth(); // initializes provider as side effect
  }
  return _googleProvider;
}

export function getFirebaseDb(): Firestore | null {
  if (!_db && firebaseEnabled) {
    const app = getApp();
    if (app) _db = getFirestore(app);
  }
  return _db;
}
