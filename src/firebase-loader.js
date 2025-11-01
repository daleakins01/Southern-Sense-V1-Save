/*
 * Firebase Loader (firebase-loader.js)
 *
 * This module is responsible for initializing the Firebase app and exporting
 * all necessary Firebase services. This ensures that Firebase is only
 * initialized once and provides a central point for all database/auth imports.
 */

// (FIX 9:06 PM): Moved 'setLogLevel' to the 'firebase-app' import, as it
// does not exist on the 'auth' module. This resolves the SyntaxError crash.
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
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
// WARNING: This is placeholder data.
// In a real production environment, this should be populated with
// the actual Firebase config object from the Firebase console.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// --- Initialization ---
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Set log level for development. This helps in debugging.
  // We can remove this in production.
  setLogLevel("debug");
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Display a user-friendly error message on the site
  const body = document.querySelector("body");
  if (body) {
    body.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
        <h1 style="color: #D97706; font-size: 2rem;">Site Connection Error</h1>
        <p style="color: #3D352E; font-size: 1.1rem;">
          We're having trouble connecting to our services. Please check your internet
          connection or try again in a few moments.
        </p>
      </div>
    `;
  }
}

// --- Exports ---
// Export the initialized services
export {
  app,
  auth,
  db,
  // Auth exports
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  // Firestore exports
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
};

