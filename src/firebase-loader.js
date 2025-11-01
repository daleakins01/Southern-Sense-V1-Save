/*
 * Firebase Loader (firebase-loader.js)
 *
 * This module is responsible for initializing the Firebase app and exporting
 * all necessary Firebase services. This ensures that Firebase is only
 * initialized once and provides a central point for all database/auth imports.
 */

// Import all the functions we need from the SDKs
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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
  onSnapshot,
  Timestamp, // Added Timestamp
  increment, // Added increment
  deleteField // Added deleteField
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Firebase Config ---
// This configuration is now correctly populated with your project's credentials.
const firebaseConfig = {
  apiKey: "AIzaSyCo2HoDVWjcrGs0frHhG3crlnVterhCRxc",
  authDomain: "southernsense-store.firebaseapp.com",
  projectId: "southernsense-store",
  storageBucket: "southernsense-store.firebasestorage.app",
  messagingSenderId: "154582397729",
  appId: "1:154582397729:web:842878fbdb64af19bb4460",
  measurementId: "G-3KHQ2T7RVZ"
};

// --- Initialize ---
// Initialize Firebase and export the core services.
// These are immediately available for any script that imports them.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
  onSnapshot,
  Timestamp,
  increment,
  deleteField
};

// --- THIS IS THE FIX ---
// Dispatch a custom 'firebase-ready' event on the document.
// Other scripts (like shop.html, product.html) can listen for this
// to know that 'db' and 'auth' are initialized and ready.
// We wrap this in a DOMContentLoaded listener to ensure the 'document' exists.
document.addEventListener('DOMContentLoaded', () => {
  const event = new CustomEvent('firebase-ready');
  document.dispatchEvent(event);
  console.log("Firebase is ready, 'firebase-ready' signal sent.");
});

