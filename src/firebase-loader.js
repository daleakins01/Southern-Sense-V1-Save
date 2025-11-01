/*
 * Firebase Loader (firebase-loader.js)
 *
 * This module is responsible for initializing the Firebase app and exporting
 * all necessary Firebase services. This ensures that Firebase is only
 * initialized once and provides a central point for all database/auth imports.
 */

// (FIX 10:11 PM): Moved 'setLogLevel' to the 'firebase-app' import, as it
// is part of the core app library, not the auth library.
import {
  initializeApp,
  setLogLevel,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  // (FIX 10:11 PM): Removed 'setLogLevel' from here.
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Config ---
// This configuration is a placeholder. In a real-world scenario,
// you would replace this with your actual Firebase project config.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// --- Initialize ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable a full debug log to the console for development.
// This was the function causing the crash.
setLogLevel("debug");

// --- Exports ---
// Export all the services and functions for other modules to use.
export {
  app,
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
  onSnapshot,
};

