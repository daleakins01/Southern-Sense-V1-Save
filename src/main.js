/*
 * Main JavaScript (main.js)
 *
 * This file contains global site logic, primarily for UI interactions
 * like the mobile navigation menu.
 *
 * (FIX 10:14 PM): Removed obsolete V1.1 "Ghost Logic" (loadHTML).
 * (FIX 10:14 PM): Updated mobile menu button ID to match header.
 */

/**
 * Attaches listeners to the mobile menu buttons.
 * This is the only logic that should be in this file.
 */
function attachMobileMenuListeners() {
  // Get buttons and the menu panel
  // (FIX 10:14 PM): Updated ID from 'mobile-menu-button' to 'mobile-menu-open-btn'
  const openBtn = document.getElementById("mobile-menu-open-btn");
  const closeBtn = document.getElementById("mobile-menu-close-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  // Check if all elements exist
  if (openBtn && closeBtn && mobileMenu) {
    // Add listener to OPEN button
    openBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
      openBtn.setAttribute("aria-expanded", "true");
    });

    // Add listener to CLOSE button
    closeBtn.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      openBtn.setAttribute("aria-expanded", "false");
    });
  } else {
    // This warning helps debug if the IDs in the header are wrong.
    console.warn("Mobile menu buttons or panel not found.");
  }
}

/**
 * Main function to run on page load.
 */
function main() {
  // (FIX 10:14 PM): All 'loadHTML' calls have been REMOVED.
  // Eleventy now handles the header and footer.

  // Attach the mobile menu listeners.
  attachMobileMenuListeners();
}

// --- Run Main Function ---
// Wait for the DOM to be fully loaded before running main.js
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  main();
} else {
  document.addEventListener("DOMContentLoaded", main);
}

