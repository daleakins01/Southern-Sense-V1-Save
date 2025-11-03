/*
 * main.js
 * This script contains core, site-wide functionality (UI interaction, auth state monitoring).
 */

// Import necessary Firebase functions for site-wide use
// FIX: Corrected import path to reference the file in the new /src/ directory
import { auth, onAuthStateChanged, signOut } from '/src/firebase-loader.js';

// --- Global UI State ---
let userIsAdmin = false;
let userIsLoggedIn = false;


/**
 * Initializes all site-wide UI and authentication listeners.
 */
function initializeMain() {
    console.log("Main script initialized.");

    // 1. Setup UI Listeners
    setupNavListeners();
    setupCartDrawer();
    setupMobileNav();

    // 2. Set up Auth Listener
    monitorAuthState();
    
    // 3. Signal that the UI is ready for content scripts (e.g., index.js)
    document.dispatchEvent(new Event('ui-ready'));
}


// --- Authentication/State Management ---

/**
 * Checks if the current user is an admin. 
 * NOTE: This is a client-side flag used for UI only. Server-side Firestore Rules provide true security.
 */
function checkAdminStatus(uid) {
    // A simple, unsafe client-side check for UI visibility
    // In a real application, this requires a Firestore lookup or custom claim.
    // For this prototype, we rely on the admins list being present.
    // Assuming a simplified check: if UID is one of the known admin UIDs from the database
    // For now, this logic is removed as the check is centralized in admin-login.html
    return false; // Placeholder
}

/**
 * Monitors Firebase Authentication state changes.
 */
function monitorAuthState() {
    // The 'auth' object must be imported from the loader
    onAuthStateChanged(auth, (user) => {
        const loginLink = document.getElementById('nav-login-link');
        const accountLink = document.getElementById('nav-account-link');
        const adminLink = document.getElementById('nav-admin-link');
        const logoutLink = document.getElementById('nav-logout-link');

        if (user) {
            // User is signed in.
            userIsLoggedIn = true;
            // The UID itself dictates admin status; we don't check a separate status here in main.js

            // UI updates
            if (loginLink) loginLink.classList.add('hidden');
            if (accountLink) accountLink.classList.remove('hidden');
            if (adminLink) adminLink.classList.add('hidden'); // Default to hidden; actual admin check happens on admin pages.
            if (logoutLink) logoutLink.classList.remove('hidden');
            
            // Special check for known admins (Placeholder for simplicity)
            // In a real app, this should fetch /admins/{uid}
            if (user.uid === 'X9r0b2YHkbZAweF0q7osfke1oik1' || user.uid === 'zUiP1lYPOLVPDxgqHM8agYhpGTu2') {
                if (adminLink) adminLink.classList.remove('hidden');
                userIsAdmin = true;
            }

        } else {
            // User is signed out.
            userIsLoggedIn = false;
            userIsAdmin = false;

            // UI updates
            if (loginLink) loginLink.classList.remove('hidden');
            if (accountLink) accountLink.classList.add('hidden');
            if (adminLink) adminLink.classList.add('hidden');
            if (logoutLink) logoutLink.classList.add('hidden');
        }
    });

    // Set up logout listener
    const logoutButton = document.getElementById('nav-logout-link');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                // Sign-out successful.
                console.log("User logged out successfully.");
                window.location.href = '/'; // Redirect to homepage
            }).catch((error) => {
                console.error("Logout failed:", error);
                alert("Logout failed. Please try again.");
            });
        });
    }
}


// --- UI Management ---

/**
 * Sets up listeners for the main and mobile navigation.
 */
function setupNavListeners() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('hidden') ? 'false' : 'true');
        });
    }
}

/**
 * Sets up the cart drawer toggle functionality.
 */
function setupCartDrawer() {
    const cartButton = document.getElementById('cart-button');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartButton = document.getElementById('close-cart-button');

    // Show Cart
    if (cartButton && cartDrawer) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            cartDrawer.classList.remove('translate-x-full');
            document.body.classList.add('overflow-hidden'); // Prevent background scrolling
        });
    }

    // Hide Cart
    if (closeCartButton && cartDrawer) {
        closeCartButton.addEventListener('click', () => {
            cartDrawer.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        });
    }
}

/**
 * Handles clicks within the mobile navigation to close the menu.
 */
function setupMobileNav() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Close the menu after a link is clicked
                mobileMenu.classList.add('hidden');
                if (mobileMenuButton) {
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
}


// --- Initialization ---

// Wait for the DOM to be fully loaded before running the main script
document.addEventListener('DOMContentLoaded', initializeMain);