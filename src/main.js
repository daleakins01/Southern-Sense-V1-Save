// --- Firebase Imports ---
import { auth, db } from '/firebase-loader.js';
import { 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { 
    collection, 
    getDocs, 
    query, 
    where 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// --- Global Constants ---
const SHIPPING_FEE = 10.00;

// --- Utility Functions ---

/**
 * Formats a scent family slug (e.g., 'fruity-sweet') to a display name (e.g., 'Fruity Sweet').
 * @param {string} slug - The scentFamily slug.
 * @returns {string} The formatted name.
 */
function formatScentFamilyName(slug) {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// --- Dynamic Navigation Logic (NEW) ---

/**
 * Fetches unique scent families from Firestore and populates the Shop dropdown menu.
 */
async function loadScentFamilyDropdown() {
    const linksContainer = document.getElementById('scent-family-links');
    if (!linksContainer) return; // Exit if not on a page that includes the header

    try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('scentFamily', '!=', null));
        const querySnapshot = await getDocs(q);

        const families = new Set();
        querySnapshot.forEach(doc => {
            const family = doc.data().scentFamily;
            if (family) {
                families.add(family);
            }
        });
        
        // Convert Set to Array and sort alphabetically
        const sortedFamilies = Array.from(families).sort();

        let linksHtml = '';
        sortedFamilies.forEach(slug => {
            const name = formatScentFamilyName(slug);
            // Link to the shop page, filtered by the scentFamily query parameter
            linksHtml += `
                <a href="/shop/?family=${slug}" class="block font-roboto text-sm text-charcoal hover:text-burnt-orange transition-colors">${name}</a>
            `;
        });
        
        linksContainer.innerHTML = linksHtml;

    } catch (error) {
        console.error("Error loading scent family dropdown:", error);
        linksContainer.innerHTML = `<p class="text-sm text-red-500">Error loading families.</p>`;
    }
}


// --- Cart Logic (Original - Simplified for context) ---

/**
 * Reads cart data from localStorage.
 * @returns {Array} The cart items array.
 */
function getCart() {
    const cart = localStorage.getItem('southernSenseCart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Updates the visual cart count in the header.
 */
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count > 99 ? '99+' : count.toString();
    }
}


// --- Auth Logic (Original - Simplified for context) ---

/**
 * Updates the header links based on the user's login status.
 * @param {Object | null} user - The Firebase Auth user object.
 */
function updateAuthLinks(user) {
    const loginLink = document.getElementById('login-link');
    const accountLink = document.getElementById('account-link');
    
    if (user) {
        if (loginLink) loginLink.classList.add('hidden');
        if (accountLink) accountLink.classList.remove('hidden');
    } else {
        if (loginLink) loginLink.classList.remove('hidden');
        if (accountLink) accountLink.classList.add('hidden');
    }
}

/**
 * Initializes the Firebase Auth observer.
 */
function initializeAuth() {
    onAuthStateChanged(auth, (user) => {
        updateAuthLinks(user);
    });
}


// --- Main Initialization ---

/**
 * Initializes all global features.
 */
function init() {
    // 1. Initialize Auth State
    initializeAuth();
    
    // 2. Initial Cart Count Display
    updateCartCount();
    
    // 3. Populate Shop Dropdown Menu (NEW)
    // We wait for firebase-ready, but since this file is loaded after firebase-loader, 
    // we use a simple check and then listen for changes.
    loadScentFamilyDropdown();

    // Listen for local storage changes (e.g., cart updates on other pages)
    window.addEventListener('storage', (event) => {
        if (event.key === 'southernSenseCart') {
            updateCartCount();
        }
    });
}

// Ensure init runs after firebase is ready (if not already loaded)
document.addEventListener('firebase-ready', init);

// If firebase-ready already fired before this script loaded (which is typical for a module load), run it now.
// This check is often complex, but using the listener is the safest approach in this codebase structure.

// Export functions for use in other modules (like product.html)
export { getCart, updateCartCount, SHIPPING_FEE };