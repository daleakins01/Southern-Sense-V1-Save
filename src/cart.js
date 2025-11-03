/*
 * cart.js
 * Handles all client-side shopping cart logic, including adding items,
 * updating quantities, saving to local storage, and rendering the cart drawer.
 */

// FIX: Corrected import path to reference the file in the new /src/ directory
import { db, collection, doc, setDoc } from '/src/firebase-loader.js';

// --- State Management ---
const CART_STORAGE_KEY = 'southernSenseCart'; // MOVED TO BE DEFINED BEFORE USE
let cart = loadCartFromStorage(); // Now called after its dependency is defined

// --- DOM Elements (Placeholders, updated when cart drawer is rendered) ---
let cartItemsContainer;
let cartTotalElement;
let checkoutButton;

/**
 * Loads the cart state from Local Storage or initializes an empty array.
 * @returns {Array} The cart array.
 */
function loadCartFromStorage() {
    try {
        // Now CART_STORAGE_KEY is guaranteed to be initialized
        const serializedCart = localStorage.getItem(CART_STORAGE_KEY); 
        return serializedCart ? JSON.parse(serializedCart) : [];
    } catch (e) {
        console.error("Could not load cart from local storage:", e);
        return [];
    }
}

/**
 * Saves the current cart state to Local Storage.
 */
function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Could not save cart to local storage:", e);
    }
}

/**
 * Adds an item to the cart or increments its quantity if it already exists.
 * @param {string} id - The product ID.
 * @param {string} name - The product name.
 * @param {number} price - The product price.
 * @param {string} imageUrl - The URL of the product image.
 * @param {number} quantity - The quantity to add (default is 1).
 */
export function addToCart(id, name, price, imageUrl, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, imageUrl, quantity });
    }

    saveCartToStorage();
    renderCartDrawer();
    // OPTIONAL: Show a quick notification or badge update
}

/**
 * Removes an item completely from the cart.
 * @param {string} id - The product ID to remove.
 */
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    renderCartDrawer();
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} id - The product ID to update.
 * @param {number} newQuantity - The new quantity.
 */
function updateItemQuantity(id, newQuantity) {
    const item = cart.find(i => i.id === id);
    if (item) {
        if (newQuantity <= 0) {
            removeItem(id);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            renderCartDrawer();
        }
    }
}

/**
 * Calculates the total price of all items in the cart.
 * @returns {number} The total price.
 */
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}


// --- Rendering ---

/**
 * Renders the full cart contents into the cart drawer DOM element.
 */
export function renderCartDrawer() {
    // Re-initialize DOM elements on render to ensure we catch them
    cartItemsContainer = document.getElementById('cart-items-container');
    cartTotalElement = document.getElementById('cart-total');
    checkoutButton = document.getElementById('checkout-button');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartStatusMessage = document.getElementById('cart-status-message');

    if (!cartItemsContainer || !cartTotalElement) {
        // This warning is fine, as renderCartDrawer is called immediately on DCL
        // on all pages, but only fully renders if the elements exist (in cart.html).
        console.warn("Cart drawer elements not found in DOM.");
        return;
    }
    
    // Update cart badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBadge) {
        cartCountBadge.textContent = totalItems;
        cartCountBadge.classList.toggle('hidden', totalItems === 0);
    }

    cartItemsContainer.innerHTML = ''; // Clear previous items

    if (cart.length === 0) {
        // Show empty cart message
        cartStatusMessage.textContent = "Your cart is currently empty.";
        cartStatusMessage.classList.remove('hidden');
        if (checkoutButton) checkoutButton.disabled = true;
    } else {
        // Hide empty cart message
        cartStatusMessage.classList.add('hidden');
        if (checkoutButton) checkoutButton.disabled = false;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center space-x-4 py-3 border-b border-stone/10';
            
            const itemTotalPrice = (item.price * item.quantity).toFixed(2);
            
            // FIX: Ensure the image path is prefixed with /src/ for the final path
            const itemImageUrl = item.imageUrl.startsWith('/src/') ? item.imageUrl : `/src/${item.imageUrl}`;

            itemElement.innerHTML = `
                <img src="${itemImageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md border border-stone/10">
                <div class="flex-grow">
                    <h4 class="font-roboto text-sm font-medium text-charcoal">${item.name}</h4>
                    <p class="font-playfair text-lg text-burnt-orange font-bold">$${itemTotalPrice}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <input type="number" min="1" value="${item.quantity}" data-item-id="${item.id}"
                           class="w-14 p-1 border border-stone/30 rounded-lg text-center font-roboto text-sm cart-quantity-input">
                    <button data-item-id="${item.id}" class="text-stone hover:text-red-500 transition remove-item-button">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Add listeners for the newly rendered elements
        setupItemListeners();
    }

    // Update total
    cartTotalElement.textContent = calculateCartTotal().toFixed(2);
}

/**
 * Sets up listeners for quantity changes and remove buttons inside the cart drawer.
 */
function setupItemListeners() {
    // Quantity changes
    cartItemsContainer.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.itemId;
            const newQuantity = parseInt(e.target.value, 10);
            updateItemQuantity(id, newQuantity);
        });
    });

    // Remove buttons
    cartItemsContainer.querySelectorAll('.remove-item-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.itemId;
            removeItem(id);
        });
    });
}

// --- Checkout Logic (Placeholder) ---

/**
 * Handles the checkout button click.
 */
function handleCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }
    
    // Placeholder logic for checkout flow
    console.log("Proceeding to checkout with cart:", cart);
    // In a real application, this would initiate a Stripe/PayPal session
    
    // For now, redirect to the Cart page (which is a static page)
    window.location.href = '/cart/'; 
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Find the checkout button and attach listener if it exists
    checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
    
    // Initial render of the cart drawer content
    renderCartDrawer();
});