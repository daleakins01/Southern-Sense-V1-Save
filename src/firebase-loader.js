/*
 * Firebase Loader (firebase-loader.js)
 *
 * This file initializes the Firebase app and exports all necessary Firebase services 
 * and functions used throughout the application (Auth, Firestore).
 * It acts as the single source of truth for all Firebase imports.
 */

// Import the functions you need from the SDKs you use
// CRITICAL FIX: Updated SDK version from 10.12.2 to 12.4.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, 
         collection, 
         doc, 
         getDoc, 
         setDoc, 
         updateDoc, 
         deleteDoc, 
         addDoc, 
         query, 
         where, 
         getDocs, 
         Timestamp,
         limit, 
         orderBy,
         serverTimestamp // CRITICAL FIX: Import serverTimestamp from Firestore SDK
       } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// Your web app's Firebase configuration (CRITICALLY FIXED with provided keys)
const firebaseConfig = {
    // CRITICAL FIX: API Key used to authenticate requests (Confirmed correct)
    apiKey: "AIzaSyCo2HoDVWjcrGs0frHhG3crlnVterhCRxc", 
    // CRITICAL FIX: Auth Domain derived from Project ID
    authDomain: "southernsense-store.firebaseapp.com",
    // CRITICAL FIX: Project ID used in console error URL (Confirmed correct)
    projectId: "southernsense-store",
    // CRITICAL FIX: Synchronized storageBucket value to southernsense-store.firebasestorage.app
    storageBucket: "southernsense-store.firebasestorage.app",
    // FINAL VALUE: Messaging Sender ID provided by user
    messagingSenderId: "154582397729", 
    // CRITICAL FIX: App ID provided by user, resolves Priority 1 initialization failure
    appId: "1:154582397729:web:842878fbdb64af19bb4460",
    // ADDED: Measurement ID provided by user for analytics
    measurementId: "G-3KHQ2T7RVZ" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);


// Export all initialized services and necessary functions for use across the application
export { 
    auth, 
    db, 
    // Auth Functions
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    // Firestore Functions
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where, 
    getDocs,
    Timestamp,
    limit,
    orderBy,
    serverTimestamp // CRITICAL FIX: Export serverTimestamp
};

; // DEFENSIVE SEMICOLON: Added to absorb potential file truncation errors.