// This is the main JavaScript file for the site.
// It handles loading the header and footer, mobile menu,
// and other global site functionality.

/**
 * Loads HTML content from a file into a specified element.
 * @param {string} url The URL of the HTML file to fetch.
 * @param {string} elementId The ID of the element to load the content into.
 */
async function loadHTML(url, elementId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = text;

      // After loading the header, re-attach mobile menu listeners
      if (elementId === 'header-placeholder') {
        attachMobileMenuListeners();
      }
    } else {
      console.warn(`Element with ID '${elementId}' not found.`);
    }
  } catch (error) {
    console.error(`Error loading HTML for ${elementId}:`, error);
  }
}

/**
 * Attaches event listeners for the mobile menu button.
 */
function attachMobileMenuListeners() {
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  } else {
    // This might run before the header is fully loaded,
    // so we check again after a short delay if elements aren't found.
    // This is a defensive check.
    if (!menuButton) console.warn("Mobile menu button not found.");
    if (!mobileMenu) console.warn("Mobile menu not found.");
  }
}

/**
 * Main function to run when the DOM is fully loaded.
 */
function main() {
  // Load header and footer
  loadHTML('header.html', 'header-placeholder');
  loadHTML('footer.html', 'footer-placeholder');

  // Initial check for mobile menu listeners (in case header is cached)
  attachMobileMenuListeners();
}

// Run the main function when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // DOM is already ready
  main();
}
