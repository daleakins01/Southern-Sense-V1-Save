/*
 * Firebase Loader (firebase-loader.js)
 *
 * This module is responsible for initializing the Firebase app and exporting
 * all necessary Firebase services. This ensures that Firebase is only
 * initialized once and provides a central point for all database/auth imports.
 */

// (FIX 9:54 PM): Moved 'setLogLevel' to the 'firebase-app' import, as it
// is a service of the core app, not the auth module.
import { initializeApp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
// (Pillar 1): This configuration is loaded from a script tag in layout.html
// which is populated by environment variables during the build.
// DO NOT paste sensitive config data here.
const firebaseConfig = window.firebaseConfig;

// --- Initialize Firebase ---
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // (FIX 9:54 PM): Set log level for easier debugging in development
  // This will be disabled in a production build.
  if (window.location.hostname === "localhost") {
    setLogLevel("debug");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Display a user-friendly error message on the page
  const body = document.querySelector("body");
  if (body) {
    body.innerHTML =
      '<div style="font-family: sans-serif; text-align: center; padding: 40px;">' +
      "<h1>Error</h1>" +
      "<p>Could not connect to services. Please check your network connection or try again later.</p>" +
      "<p><i>Error details: " +
      error.message +
      "</i></p>" +
      "</div>";
  }
}

// --- Exports ---
// Export the initialized services for other modules to use.
export {
  app,
  auth,
  db,
  // Auth methods
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  // Firestore methods
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  onSnapshot,
};

