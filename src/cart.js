/*
 * cart.js
 * Manages client-side shopping cart state (localStorage) and core functions.
 * Exports: addToCart, updateCartDisplay, renderCartDrawer, initializeCart, handleCheckout
 */

// CRITICAL FIX: Ensure serverTimestamp is imported here
import { 
    db, 
    collection, 
    addDoc, 
    serverTimestamp, 
    auth 
    // Removed: doc, getDoc, updateDoc (not used in cart.js for the core cart logic)
} from '/src/firebase-loader.js';

// --- Global Constants & State ---
const CART_STORAGE_KEY = 'southernSenseCart';
const SHIPPING_RATE = 8.00; // Flat rate shipping for simplicity

/**
 * Retrieves the cart data from local storage.
 * @returns {Array<Object>} The cart items array.
 */
function getCart() {
    try {
        const cartString = localStorage.getItem(CART_STORAGE_KEY);
        return cartString ? JSON.parse(cartString) : [];
    } catch (e) {
        console.error("Error retrieving cart from localStorage:", e);
        return [];
    }
}

/**
 * Saves the current cart data to local storage.
 * @param {Array<Object>} cart - The cart items array.
 */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Error saving cart to localStorage:", e);
    }
}

/**
 * Calculates the cart totals (subtotal, shipping, total).
 * @param {Array<Object>} cart - The cart items array.
 * @returns {Object} The calculated totals.
 */
function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => {
        // Ensure price is treated as a number
        const price = parseFloat(item.price);
        // Use optional chaining for safety, though it shouldn't be needed after adding to cart
        const quantity = item.quantity || 0; 
        return sum + (price * quantity);
    }, 0);

    // Only charge shipping if there are items
    const shipping = subtotal > 0 ? SHIPPING_RATE : 0.00; 

    const total = subtotal + shipping;

    return {
        subtotal: subtotal,
        shipping: shipping,
        total: total
    };
}


// --- Cart Modification Functions ---

/**
 * Adds a product to the cart or increments quantity if it already exists.
 * @param {Object} product - The product object to add (must contain id, name, price, imageUrl).
 * @param {number} quantity - The quantity to add.
 */
function addToCart(product, quantity = 1) { // Removed export
    if (!product || !product.id) {
        console.error("Cannot add to cart: Invalid product object.");
        return;
    }

    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    // FIX: Ensure incoming price is always parsed to a float
    const price = parseFloat(product.price);

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Item is new, add it to the cart
        const newItem = {
            id: product.id,
            name: product.name,
            price: price,
            imageUrl: product.imageUrl,
            quantity: quantity,
        };
        cart.push(newItem);
    }

    saveCart(cart);
    updateCartDisplay();
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} productId - The ID of the product to update.
 * @param {number} newQuantity - The new quantity.
 */
function updateItemQuantity(productId, newQuantity) {
    let cart = getCart();
    
    if (newQuantity <= 0) {
        // Remove item if quantity is zero or less
        cart = cart.filter(item => item.id !== productId);
    } else {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
        }
    }

    saveCart(cart);
    renderCartDrawer(); // Re-render the cart view
    updateCartDisplay(); // Update the counter
}

/**
 * Removes a product completely from the cart.
 *