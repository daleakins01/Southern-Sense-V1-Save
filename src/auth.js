/*
 * Authentication Logic (auth.js)
 *
 * This module exports functions for user authentication (registration, login, logout)
 * and ensures that user profiles are created/managed in Firestore upon registration.
 */

import { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    doc, 
    setDoc, 
    Timestamp 
} from '/firebase-loader.js';

// --- Constants ---
// Define the Firestore collection where customer profiles are stored
const USERS_COLLECTION = 'users';

/**
 * Registers a new user with Firebase Auth and creates a corresponding Firestore profile.
 * * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {Promise<Object>} The authenticated user object and a reference to the profile.
 */
export async function registerUser(email, password, firstName, lastName) {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Create user profile document in Firestore (using UID as the document ID)
    const userProfileRef = doc(db, USERS_COLLECTION, user.uid);
    
    // Ensure all required fields (firstName, lastName, role, etc.) are set for /account.html logic
    const profileData = {
        userId: user.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: 'customer', // Default role for new users
        createdAt: Timestamp.now()
    };
    
    // Firestore security rules (Firestore Rules file) expect the UID to be the document ID 
    // and the request.auth.uid to match that ID upon creation.
    await setDoc(userProfileRef, profileData);

    console.log("User registered and profile created in Firestore:", user.uid);
    return user;
}

/**
 * Logs in an existing user with Firebase Auth.
 * * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The authenticated user object.
 */
export async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user.uid);
    return userCredential.user;
}

/**
 * Logs out the current user.
 * * @returns {Promise<void>}
 */
export async function logout() {
    await signOut(auth);
    console.log("User logged out.");
}

// NOTE: onAuthStateChanged is handled directly in page scripts (e.g., account.html, admin.html)
// using the imported auth object, not exported from here.