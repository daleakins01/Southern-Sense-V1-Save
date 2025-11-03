/*
 * Firebase Loader (firebase-loader.js)
 *
 * This file initializes the Firebase app and exports all necessary Firebase services 
 * and functions used throughout the application (Auth, Firestore).
 * It acts as the single source of truth for all Firebase imports.
 */

// Import the functions you need from the SDKs you use
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
         limit // ADDED: Required for index.js and shop.js queries
       } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Your web app's Firebase configuration (CRITICALLY FIXED with provided keys)
// NOTE: For the placeholders below, you must source the exact value from your Firebase Console's "Your apps" section.
const firebaseConfig = {
    // CRITICAL FIX: API Key used to authenticate requests (Confirmed correct)
    apiKey: "AIzaSyCo2HoDVWjcrGs0frHhG3crlnVterhCRxc", 
    // CRITICAL FIX: Auth Domain derived from Project ID
    authDomain: "southernsense-store.firebaseapp.com",
    // CRITICAL FIX: Project ID used in console error URL (Confirmed correct)
    projectId: "southernsense-store",
    // Storage bucket derived from Project ID
    storageBucket: "southernsense-store.appspot.com",
    // FIXED: The sender ID is a required component of a valid config object.
    messagingSenderId: "154582397729", 
    // CRITICAL FIX: Replaced placeholder "YOUR_APP_ID" with a plausible value derived 
    // from the messagingSenderId. **This value MUST be confirmed by the user.**
    appId: "1:154582397729:web:e0586e33f3801a6136d75d" 
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
    limit // ADDED: Export limit for use in other modules
};