/*
 * Main JavaScript (main.js)
 *
 * This file contains global site logic, primarily for UI interactions
 * like the mobile navigation menu.
 *
 * V1.1 (Obsolete) Logic Removed:
 * - Removed loadHTML() function. Header/Footer are now built by Eleventy.
 */

/**
 * Attaches event listeners for the mobile navigation menu.
 */
function attachMobileMenuListeners() {
  // (FIX 9:06 PM): Updated ID to match the new header.
  // Old ID: "mobile-menu-button"
  const openButton = document.getElementById("mobile-menu-open-btn");
  const closeButton = document.getElementById("mobile-menu-close-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (openButton && closeButton && mobileMenu) {
    // Open menu
    openButton.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
    });

    // Close menu
    closeButton.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });
  } else {
    // Log an error if any element is missing
    if (!openButton) console.error("Mobile menu open button not found.");
    if (!closeButton) console.error("Mobile menu close button not found.");
    if (!mobileMenu) console.error("Mobile menu element not found.");
  }
}

/**
 * Initializes all global site scripts.
 */
function main() {
  // (FIX 9:06 PM): Removed obsolete V1.1 header/footer loading.
  // loadHTML("/header.html", "header-placeholder");
  // loadHTML("/footer.html", "footer-placeholder");

  // Attach listeners for the mobile menu
  attachMobileMenuListeners();

  // (Pillar 1): Check auth state to update UI
  // This logic is in auth.js, but we might add a global
  // function here later to show/hide "Account" vs "Login"
}

// --- Main Execution ---
// Wait for the DOM to be fully loaded before running scripts
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  main();
} else {
  document.addEventListener("DOMContentLoaded", main);
}

