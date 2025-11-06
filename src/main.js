/*
 * main.js
 * General client-side UI and utility functions.
 * Scent Quiz logic has been removed from this global file to prevent dependency conflicts 
 * and is now intended to be contained within src/scent-quiz.html's inline script.
 */

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

// FIX: Removed the global call to initializeScentQuiz() to prevent dependency conflicts 
// and is now intended to be contained within src/scent-quiz.html's inline script.

; // DEFENSIVE SEMICOLON: Added to absorb potential file truncation errors.