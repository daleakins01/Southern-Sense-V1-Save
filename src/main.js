/*
 * Main Site Functions (main.js)
 *
 * This script runs globally on all pages (except specialized ones like cart/checkout)
 * and handles essential site-wide functionality:
 * 1. Populating the dynamic "Shop by Scent Family" dropdown menu in the header.
 * 2. Handling the mobile menu toggle.
 * 3. Setting up authentication-dependent navigation links.
 */

import { 
    db, 
    collection, 
    query, 
    getDocs,
    auth,
    onAuthStateChanged,
    signOut // Import signOut directly for logout link functionality
} from '/firebase-loader.js';

// --- Constants & Global State ---
const MOBILE_MENU_ID = 'mobile-menu';
const MENU_TOGGLE_ID = 'menu-toggle';
const SCENT_FAMILY_DROPDOWN_DESKTOP_ID = 'scent-family-dropdown-desktop'; // New ID
const SCENT_FAMILY_DROPDOWN_MOBILE_ID = 'scent-family-dropdown-mobile'; // New ID
const ACCOUNT_LINK_ID = 'account-nav-link';
const LOGOUT_LINK_ID = 'logout-nav-link'; // Used for mobile logout

// --- Utility Functions ---

/**
 * Capitalizes the first letter of each word in a hyphenated string.
 */
function formatScentFamily(str) {
    if (!str) return 'Uncategorized';
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


// --- Dynamic Navigation Logic ---

/**
 * Fetches all unique scent families from Firestore products and populates the dropdowns.
 */
async function loadScentFamilyMenu() {
    const desktopDropdown = document.getElementById(SCENT_FAMILY_DROPDOWN_DESKTOP_ID);
    const mobileDropdown = document.getElementById(SCENT_FAMILY_DROPDOWN_MOBILE_ID);
    
    // Check if at least one container exists before proceeding
    if (!desktopDropdown && !mobileDropdown) return;

    try {
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(query(productsRef));

        const scentFamilies = new Set();
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.scentFamily) {
                scentFamilies.add(data.scentFamily);
            }
        });

        const sortedFamilies = Array.from(scentFamilies).sort();

        // Build the dynamic links HTML for both menus
        let desktopLinksHtml = '';
        let mobileLinksHtml = '';
        
        sortedFamilies.forEach(family => {
            const formattedName = formatScentFamily(family);
            const link = `<a href="/shop/?family=${family}" class="block px-4 py-2 text-stone hover:bg-parchment/70 hover:text-charcoal transition">${formattedName}</a>`;
            desktopLinksHtml += link;
            
            // Mobile links need different padding/styling due to the details structure
            const mobileLink = `<a href="/shop/?family=${family}" class="block px-3 py-2 text-stone hover:bg-white transition">${formattedName}</a>`;
            mobileLinksHtml += mobileLink;
        });

        // 1. Inject into Desktop Menu
        if (desktopDropdown) {
            const desktopAllLinkContainer = desktopDropdown.querySelector('.shop-all-link-container');
            if (desktopAllLinkContainer) {
                desktopAllLinkContainer.insertAdjacentHTML('beforebegin', desktopLinksHtml);
            }
        }
        
        // 2. Inject into Mobile Menu (Append BEFORE the existing "Shop All" link)
        if (mobileDropdown) {
            const mobileShopAllLink = mobileDropdown.querySelector('a[href="/shop/"]');
            if (mobileShopAllLink) {
                mobileShopAllLink.insertAdjacentHTML('beforebegin', mobileLinksHtml);
            } else {
                // Fallback if mobile structure is too minimal
                mobileDropdown.innerHTML = mobileLinksHtml + mobileDropdown.innerHTML;
            }
        }


    } catch (error) {
        console.error("CRITICAL: Error loading scent family menu. Dynamic content fetching failed:", error);
        // This is a likely reason why the homepage/shop failed to load content.
        // We will allow the rest of the site logic to proceed, but log the error.
    }
}

// --- UI Logic ---

/**
 * Toggles the mobile navigation menu state.
 */
function setupMobileMenuToggle() {
    const toggle = document.getElementById(MENU_TOGGLE_ID);
    const menu = document.getElementById(MOBILE_MENU_ID);

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            // Toggle aria attributes for accessibility
            const isExpanded = menu.classList.contains('hidden') ? 'false' : 'true';
            toggle.setAttribute('aria-expanded', isExpanded);
        });
    }
}

/**
 * Updates the navigation bar based on the user's login state.
 */
function setupAuthNavigation() {
    const authLinksContainer = document.getElementById('auth-links-container');
    const logoutLink = document.getElementById(LOGOUT_LINK_ID);
    
    // Select all elements that depend on auth state for both desktop and mobile
    const loggedInOnlyElements = document.querySelectorAll('.logged-in-only');
    const loggedOutOnlyElements = document.querySelectorAll('.logged-out-only');


    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is logged in: Show Account/Logout, Hide Login/Register
            authLinksContainer?.classList.add('logged-in'); 
            authLinksContainer?.classList.remove('logged-out');
            
            // Toggle visibility classes
            loggedInOnlyElements.forEach(el => el.classList.remove('hidden'));
            loggedOutOnlyElements.forEach(el => el.classList.add('hidden'));

        } else {
            // User is logged out: Hide Account/Logout, Show Login/Register
            authLinksContainer?.classList.add('logged-out');
            authLinksContainer?.classList.remove('logged-in');
            
            // Toggle visibility classes
            loggedInOnlyElements.forEach(el => el.classList.add('hidden'));
            loggedOutOnlyElements.forEach(el => el.classList.remove('hidden'));

            // Set up Logout link listener for the mobile menu button
            if (logoutLink) {
                logoutLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await signOut(auth);
                        window.location.href = '/login/'; // Redirect after logout
                    } catch (error) {
                        console.error("Logout failed:", error);
                        alert("Logout failed. Please try again.");
                    }
                });
            }
        }
    });
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup global UI features
    setupMobileMenuToggle();
    
    // 2. Load dynamic navigation links (Priority Fix: Restores functionality)
    loadScentFamilyMenu();
    
    // 3. Setup authentication-dependent links
    setupAuthNavigation();
});