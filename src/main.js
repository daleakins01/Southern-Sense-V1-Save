/*
  Southern Sense - main.js
  --------------------------
  Primary JavaScript file for site-wide functionality.
  Includes:
  1. Mobile Menu Toggle
  2. Dynamic HTML Content Loading (for admin, product, etc. - DEPRECATED)
  3. General utilities
*/

/**
 * Main function to initialize all site scripts.
 * This runs after the DOM is fully loaded.
 */
function main() {
  console.log('Southern Sense main.js loaded.');
  attachMobileMenuListeners();
  
  // (DEPRECATED)
  // The 'loadHTML' function was part of the old, broken build system.
  // It is no longer needed as Eleventy now builds all pages.
  // We are keeping it here but commented out for historical reference.
  // loadHTML();
}

/**
 * (DEPRECATED)
 * Dynamically loads shared HTML content like headers and footers.
 * This is no longer in use, as Eleventy's layout system handles this.
 */
/*
function loadHTML() {
  const elements = document.querySelectorAll('[include-html]');
  console.log(`Found ${elements.length} elements to include HTML.`); // Debug log
  
  Array.prototype.forEach.call(elements, function(el) {
    const file = el.getAttribute('include-html');
    if (file) {
      console.log(`Fetching ${file}`); // Debug log
      fetch(file)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(data => {
          el.innerHTML = data;
          el.removeAttribute('include-html');
          
          // After loading, re-attach listeners if it was the header
          if (file.includes('header.html')) {
            console.log('Header loaded, re-attaching mobile menu listeners.');
            attachMobileMenuListeners();
          }
        })
        .catch(err => {
          console.error(`Error loading HTML from ${file}:`, err);
          el.innerHTML = `<p class="text-red-500">Error: Could not load ${file}</p>`;
        });
    }
  });
}
*/

/**
 * Attaches click event listeners for the mobile (hamburger) menu.
 * Toggles visibility of the mobile menu panel.
 */
function attachMobileMenuListeners() {
  // ---
  // FIX (1:57 PM):
  // Correcting the IDs to match the IDs in `_includes/header.html`
  // This fixes the 'not found' error.
  // ---
  
  // These IDs MUST match the IDs in `_includes/header.html`
  const openButton = document.getElementById('mobile-menu-open-button');
  const closeButton = document.getElementById('mobile-menu-close-button');
  const menuPanel = document.getElementById('mobile-menu-panel');

  if (openButton && closeButton && menuPanel) {
    // Show the panel when open button is clicked
    openButton.addEventListener('click', () => {
      menuPanel.classList.remove('hidden');
    });

    // Hide the panel when close button is clicked
    closeButton.addEventListener('click', () => {
      menuPanel.classList.add('hidden');
    });
    
    // Optional: Hide the panel if clicking outside of it (on the overlay)
    // The first child of the menuPanel is the overlay div
    if (menuPanel.firstElementChild && menuPanel.firstElementChild.tagName === 'DIV') {
      menuPanel.firstElementChild.addEventListener('click', () => {
        menuPanel.classList.add('hidden');
      });
    }
    
  } else {
    // This error means the IDs in this file don't match the IDs in header.html
    console.error('Mobile menu buttons or panel not found.');
  }
}

// ---
// Initializer
// ---
// We wrap the main() call in a DOMContentLoaded listener to ensure
// the HTML is fully parsed before we try to find elements.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // DOM is already loaded
  main();
}

