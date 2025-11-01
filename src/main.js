// This is the main JavaScript file for the Southern Sense website.
// It handles global functionality like the mobile menu and cart count.

/**
 * Main function to initialize all site scripts.
 * This is the entry point for all client-side JavaScript.
 */
function main() {
    console.log("Southern Sense main.js loaded.");
    
    // Initialize event listeners
    attachMobileMenuListeners();
    
    // Other global initializations can go here...
    // e.g., initializeCartBubble();
}

/**
 * Attaches click event listeners to the mobile menu button and panel.
 * This allows the user to toggle the mobile navigation.
 * * FIX 5.1: This function is now called *after* the DOM is loaded,
 * so 'button' and 'panel' will be found.
 */
function attachMobileMenuListeners() {
    const button = document.getElementById('mobile-menu-button');
    const panel = document.getElementById('mobile-menu-panel');
    const svgOpen = button ? button.querySelector('svg') : null; // Get the hamburger icon
    const svgClose = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // Create a close icon (X)
    
    // Configure the close icon
    svgClose.setAttribute('class', 'w-8 h-8');
    svgClose.setAttribute('fill', 'none');
    svgClose.setAttribute('stroke', 'currentColor');
    svgClose.setAttribute('viewBox', '0 0 24 24');
    svgClose.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
    svgClose.style.display = 'none'; // Hide it initially

    if (button && panel && svgOpen) {
        // Add the close icon to the button
        button.appendChild(svgClose);

        button.addEventListener('click', () => {
            const isHidden = panel.classList.toggle('hidden');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Toggle visibility
            panel.setAttribute('aria-hidden', isHidden);
            button.setAttribute('aria-expanded', !isExpanded);

            // Toggle icons
            if (isHidden) {
                svgOpen.style.display = 'block';
                svgClose.style.display = 'none';
                button.setAttribute('aria-label', 'Open navigation menu');
            } else {
                svgOpen.style.display = 'none';
                svgClose.style.display = 'block';
                button.setAttribute('aria-label', 'Close navigation menu');
            }
        });
    } else {
        // This log will no longer appear, but we keep it for safety.
        console.warn("Mobile menu buttons or panel not found.");
    }
}


// --- Utility Functions ---

/**
 * Formats a price (in cents or as a string) into a USD currency string.
 * e.g., 2000 -> "$20.00"
 * e.g., "20.00" -> "$20.00"
 * @param {number|string} price - The price in cents or as a string.
 * @returns {string} - A formatted USD string.
 */
function formatPrice(price) {
    let priceInCents;
    if (typeof price === 'string') {
        priceInCents = parseFloat(price) * 100;
    } else if (typeof price === 'number') {
        // Assume it's already in cents if it's a large integer
        // This logic might need refinement based on data source
        if (price > 1000) { 
            priceInCents = price;
        } else {
            priceInCents = price * 100;
        }
    } else {
        return "$0.00";
    }

    if (isNaN(priceInCents)) {
        return "$0.00";
    }

    return (priceInCents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
}


// --- Global Execution ---

/**
 * FIX 5.1:
 * We must wait for the DOM to be fully loaded before running main().
 * This prevents the "Mobile menu buttons... not found" error,
 * which was a race condition.
 */
document.addEventListener('DOMContentLoaded', main);
