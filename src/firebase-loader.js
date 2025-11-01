import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- CRITICAL CONFIGURATION STEP ---
//
// This 'firebaseConfig' object has been populated with the
// credentials you provided at 3:34 PM.
//
const firebaseConfig = {
  apiKey: "AIzaSyCo2HoDVWjcrGs0frHhG3crlnVterhCRxc",
  authDomain: "southernsense-store.firebaseapp.com",
  projectId: "southernsense-store",
  storageBucket: "southernsense-store.firebasestorage.app",
  messagingSenderId: "154582397729",
  appId: "1:154582397729:web:842878fbdb64af19bb4460",
  measurementId: "G-3KHQ2T7RVZ"
};
// 
// --- END OF CONFIGURATION STEP ---
//


// --- Firebase Service Initialization ---
// We initialize Firebase here, once, and export the services.
// Any other file that needs Firebase (like auth.js or cart.js)
// will import 'db' and 'auth' from this file.

let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Display a user-friendly error on the page
    const body = document.querySelector('body');
    if (body) {
        body.innerHTML = `<div style="padding: 40px; text-align: center; font-family: sans-serif; background-color: #fff1f2; color: #b91c1c; border: 1px solid #fecaca;">
            <h1>Firebase Configuration Error</h1>
            <p>The website could not connect to Firebase. This is usually due to an incorrect <code>firebaseConfig</code> object in <code>firebase-loader.js</code>.</p>
            <p>Please ensure you have copied the correct config from your Firebase project console.</p>
            <p><i>Error: ${error.message}</i></p>
        </div>`;
    }
}


// --- Global Authentication Listener ---
// This runs on EVERY page load. It checks if the user is logged in
// and manages page access and UI elements.

onAuthStateChanged(auth, (user) => {
    // These are the nav links in the header
    const accountLink = document.getElementById('nav-account-link');
    const loginLink = document.getElementById('nav-login-link');
    
    // This is the current page's URL path
    const currentPage = window.location.pathname;

    if (user) {
        // --- USER IS LOGGED IN ---
        
        // 1. Show "Account" link, hide "Login" link in header
        if (accountLink) accountLink.classList.remove('hidden');
        if (loginLink) loginLink.classList.add('hidden');
        
        // 2. If user is on the login or register page, redirect them to /account/
        if (currentPage.startsWith('/login/') || currentPage.startsWith('/register/')) {
            console.log("User is logged in, redirecting from auth page to account...");
            window.location.href = '/account/';
        }
        
    } else {
        // --- USER IS LOGGED OUT ---
        
        // 1. Show "Login" link, hide "Account" link in header
        if (accountLink) accountLink.classList.add('hidden');
        if (loginLink) loginLink.classList.remove('hidden');
        
        // 2. If user is on the /account/ page, redirect them to /login/
        if (currentPage.startsWith('/account/')) {
            console.log("User is not logged in, redirecting from account page to login...");
            window.location.href = '/login/';
        }
    }
});


// --- Exports ---
// Export the initialized services so other modules can use them.
export { db, auth, app };

