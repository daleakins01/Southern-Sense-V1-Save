// src/firebase-loader.js
// This is the central entry point for all Firebase-related logic.
// It initializes Firebase and then kicks off the auth and cart systems.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  setLogLevel
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Import our application modules
import { initializeCart } from './cart.js';
import { initializeAuth } from './auth.js';

// --- Firebase Initialization ---

// These globals are provided by the Canvas environment or defined in the layout.
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable debug logging for Firebase Auth
setLogLevel('debug');

// --- Authentication State Management ---

let authInitialized = false;

/**
 * Handles the authentication state change.
 * This is the core function that connects auth to the rest of the app.
 * @param {User | null} user The Firebase user object, or null if logged out.
 */
function onAuthReady(user) {
  if (authInitialized) return; // Prevent double-initialization
  authInitialized = true;

  const uid = user ? user.uid : null;
  console.log(`Firebase Loader: Auth ready. User ID: ${uid || 'Guest'}`);

  // 1. Initialize Authentication (for login forms, account page, etc.)
  // This will also handle UI updates for login/logout links.
  initializeAuth(user);

  // 2. Initialize Shopping Cart (with the user's ID or as a guest)
  initializeCart(uid);

  // 3. Handle Page Redirection (Security)
  const currentPage = window.location.pathname.split('/').pop();

  if (user) {
    // User is LOGGED IN
    if (currentPage === 'login.html' || currentPage === 'register.html') {
      // User is logged in but on login/register page, send to account
      console.log("User logged in, redirecting from auth page to account.");
      window.location.href = 'account.html';
    }
  } else {
    // User is LOGGED OUT
    if (currentPage === 'account.html' || currentPage === 'checkout.html') {
      // User is logged out but on a protected page, send to login
      console.log("User logged out, redirecting from protected page to login.");
      window.location.href = 'login.html';
    }
  }
}

/**
 * Main function to start the auth process.
 */
async function main() {
  // Listen for authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      onAuthReady(user);
    } else {
      // User is signed out.
      // We still call onAuthReady(null) to initialize cart/auth for a guest.
      onAuthReady(null);
    }
  });

  // Try to sign in with the provided token or anonymously
  if (auth.currentUser) {
    return onAuthReady(auth.currentUser);
  }

  try {
    if (initialAuthToken) {
      console.log("Signing in with custom token...");
      await signInWithCustomToken(auth, initialAuthToken);
      // onAuthStateChanged will handle the rest
    } else {
      console.log("No custom token, signing in anonymously...");
      await signInAnonymously(auth);
      // onAuthStateChanged will handle the rest
    }
  } catch (error) {
    console.error("Firebase sign-in error:", error);
    // If sign-in fails, initialize as a guest
    onAuthReady(null);
  }
}

// Start the application
main();
