// firebase-loader.js
// Southern Sense – Unified Firebase loader (modular SDK, 2025-11-01)

// --- Firebase Core Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setLogLevel,
  Timestamp,
  query,
  where       // ✅ Added for Firestore queries
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// --- Configuration (Real Firebase Project) ---
const firebaseConfig = {
  apiKey: "AIzaSyCo2HoDVWjcrGs0frHhG3crlnVterhCRxc",
  authDomain: "southernsense-store.firebaseapp.com",
  projectId: "southernsense-store",
  storageBucket: "southernsense-store.firebasestorage.app",
  messagingSenderId: "154582397729",
  appId: "1:154582397729:web:842878fbdb64af19bb4460",
  measurementId: "G-3KHQ2T7RVZ"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Optional: enable Firestore debug logs if needed
// setLogLevel("debug");

// --- Global exposure for other scripts ---
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;

// Helpful global flag
window._southernsense_firebase_init = false;

// --- Dispatch firebase-ready event globally ---
document.addEventListener("DOMContentLoaded", () => {
  window._southernsense_firebase_init = true;
  const event = new CustomEvent("firebase-ready");
  window.dispatchEvent(event);
  console.log("Firebase is ready, 'firebase-ready' signal sent.");
});

// --- Export for other modules ---
export { app, db, auth };
export {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  Timestamp,
  query,   // ✅ Added
  where    // ✅ Added
};
