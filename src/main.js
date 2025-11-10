/*
 * main.js
 * General client-side UI and utility functions.
 * Scent Quiz logic has been removed from this global file to prevent dependency conflicts 
 * and is now intended to be contained within src/scent-quiz.html's inline script.
 */

import { auth, onAuthStateChanged } from '/src/firebase-loader.js';

// --- 1. Global UI / Navigation (Executed immediately on module import, after DOMContentLoaded) ---

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // Toggle ARIA attributes for accessibility
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    });
}

// Sticky Header Logic (Simple implementation)
// CRITICAL FIX: Target the specific header ID for robust selection.
const header = document.getElementById('main-header');
if (header) {
    // Debounce or Throttle this for better performance in a full application
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            // Add classes for sticky effect
            header.classList.add('shadow-md', 'bg-parchment/95');
            header.classList.remove('bg-parchment');
        } else {
            // Remove classes when scrolling back to the top
            header.classList.remove('shadow-md', 'bg-parchment/95');
            header.classList.add('bg-parchment');
        }
    });
}

// --- UX FIX: Dynamically update the Account/Login link based on auth status ---
const accountLink = document.getElementById('account-link');
const mobileLoginLink = document.querySelector('#mobile-menu a[href="/login/"]');

if (accountLink) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Logged In: Change link to Account
            accountLink.href = '/account/';
            if (mobileLoginLink) {
                mobileLoginLink.href = '/account/';
                mobileLoginLink.textContent = 'My Account';
            }
        } else {
            // Logged Out: Change link to Login
            accountLink.href = '/login/';
            if (mobileLoginLink) {
                mobileLoginLink.href = '/login/';
                mobileLoginLink.textContent = 'Sign In / Account';
            }
        }
    });
}

// CRITICAL FIX: Aggressively restore the correct page title after 3rd party scripts run.
// This is done by querying the value of the original HTML title tag, which is set by Eleventy.
const initialTitle = document.title;
if (initialTitle) {
    let attempts = 0;
    const maxAttempts = 5;
    const interval = 20; // Check every 20ms

    const fixTitleInterval = setInterval(() => {
        // If the title is corrupted (shows 'true', 'false', or is not the initial valid title)
        if (document.title !== initialTitle) {
            document.title = initialTitle;
            console.log(`Title corruption fixed on attempt ${attempts + 1}.`);
        }
        
        attempts++;
        
        // Stop checking after max attempts or if a stable version has loaded
        if (attempts >= maxAttempts) {
            clearInterval(fixTitleInterval);
            if (document.title === 'true' || document.title === 'false') {
                 console.error("Critical: Failed to fix title after maximum attempts. Content is likely cached.");
            }
        }
    }, interval);
}


// FIX: Removed the global call to initializeScentQuiz() to prevent dependency conflicts 
// and is now intended to be contained within src/scent-quiz.html's inline script.

; // DEFENSIVE SEMICOLON: Added to absorb potential file truncation errors.