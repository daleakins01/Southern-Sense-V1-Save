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
    auth, 
    onAuthStateChanged // Import necessary Auth function
} from '/src/firebase-loader.js';

// --- Global Constants & State ---
const CART_STORAGE_KEY = 'southernSenseCart';
const SHIPPING_RATE = 8.00; // Flat rate shipping for simplicity

// --- PayPal Button Logic ---
const CHECKOUT_BUTTON_ID = 'checkout-button';
const CART_STATUS_MESSAGE_ID = 'cart-status-message';
const CHECKOUT_CONTAINER_ID = 'checkout-container';

/**
 * Retrieves the cart data from local storage.
 * @returns {Array<Object>} The cart items array.
 */
function getCart() {
    try {
        const cartString = localStorage.getItem(CART_STORAGE_KEY);
        const cartData = cartString ? JSON.parse(cartString) : [];

        // CRITICAL FIX: Check if the parsed data is an array (to catch corruption like stored strings or numbers)
        if (!Array.isArray(cartData)) {
            console.error("Cart data in localStorage is corrupted (not an array). Auto-resetting cart.");
            clearCart(); // Clear the bad data immediately
            return [];
        }
        return cartData;
    } catch (e) {
        console.error("Error retrieving cart from localStorage: Data failed JSON parse. Auto-resetting cart.", e);
        // Force reset on parse failure
        clearCart(); 
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
function addToCart(product, quantity = 1) { 
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
    
    // Ensure quantity is an integer
    newQuantity = parseInt(newQuantity, 10);

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
 * @param {string} productId - The ID of the product to remove.
 */
function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartDrawer();
    updateCartDisplay();
}

/**
 * Clears the entire cart.
 */
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartDisplay();
    // NOTE: Intentionally do NOT call renderCartDrawer here as the calling function (submitOrderToFirestore) handles the redirect.
}


// --- UI / Display Functions ---

/**
 * Updates the item count in the global header cart icon.
 */
function updateCartDisplay() { 
    const cart = getCart();
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    document.querySelectorAll('.cart-item-count').forEach(el => {
        el.textContent = itemCount;
        if (itemCount > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

/**
 * Renders the contents of the cart page/drawer.
 */
function renderCartDrawer() { 
    const cart = getCart();
    const totals = calculateTotals(cart);
    const itemsContainer = document.getElementById('cart-items-container');
    const message = document.getElementById(CART_STATUS_MESSAGE_ID);
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutButton = document.getElementById(CHECKOUT_BUTTON_ID);

    if (!itemsContainer || !subtotalEl || !totalEl) return;
    
    subtotalEl.textContent = totals.subtotal.toFixed(2);
    totalEl.textContent = totals.total.toFixed(2);

    if (cart.length === 0) {
        itemsContainer.innerHTML = '';
        message.classList.remove('hidden');
        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Proceed to Checkout'; // Reset text
            // Clear PayPal button container if cart is empty
            checkoutButton.innerHTML = 'Proceed to Checkout'; 
            checkoutButton.classList.add('bg-burnt-orange'); // Re-add default class
        }
        return;
    }

    message.classList.add('hidden');
    
    // Render Items
    let itemsHtml = '';
    cart.forEach(item => {
        // Ensure correct image URL format
        const imageUrl = item.imageUrl?.startsWith('http') ? item.imageUrl : '/src/' + item.imageUrl;
        const itemTotal = (item.price * item.quantity).toFixed(2);

        itemsHtml += `
            <div class="flex flex-col sm:flex-row sm:items-center py-4">
                <div class="flex items-start w-full sm:w-auto mb-2 sm:mb-0">
                    <img src="${imageUrl}" alt="${item.name}" class="w-14 h-14 object-cover rounded-md flex-shrink-0 mr-4">
                    <div class="flex-grow">
                        <p class="font-medium text-charcoal">${item.name}</p>
                        <p class="text-sm text-stone">$${item.price.toFixed(2)} ea</p>
                    </div>
                </div>
                
                <div class="flex items-center space-x-4 w-full sm:w-auto sm:ml-auto justify-end">
                    <input type="number" data-id="${item.id}" value="${item.quantity}" min="1" 
                           class="w-16 p-2 border border-stone/30 rounded-lg text-center text-charcoal quantity-input focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange">
                    <span class="font-bold text-charcoal w-16 text-right">$${itemTotal}</span>
                    <button data-id="${item.id}" class="text-stone hover:text-red-600 remove-item-button transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        `;
    });
    itemsContainer.innerHTML = itemsHtml;
    
    // Attach event listeners for quantity changes and removal
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value, 10);
            updateItemQuantity(productId, newQuantity);
        });
    });

    document.querySelectorAll('.remove-item-button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Traverse up to find the closest element with the data-id
            const productId = e.currentTarget.dataset.id;
            removeItem(productId);
        });
    });
    
    // Render PayPal button only if totals are calculated and SDK is loaded
    if (totals.total > 0 && typeof paypal !== 'undefined') {
        renderPayPalButton(totals);
    } else if (checkoutButton) {
        // Fallback to static button if PayPal SDK fails to load
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Checkout'; 
    }
}

// --- PayPal & Checkout Core Logic ---

/**
 * Gets the current user's UID (or null for guest).
 */
function getUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

/**
 * Renders the PayPal buttons using the SDK.
 */
function renderPayPalButton(totals) {
    const totalAmount = totals.total.toFixed(2);
    const checkoutButtonContainer = document.getElementById(CHECKOUT_BUTTON_ID);

    if (!checkoutButtonContainer || typeof paypal === 'undefined') {
        console.error("PayPal SDK not loaded or button container not found.");
        return;
    }
    
    // Clear the static button content and remove styling for PayPal SDK to take over
    checkoutButtonContainer.innerHTML = '';
    // Remove static button styles that might interfere with PayPal iframe and ADD w-full
    checkoutButtonContainer.classList.remove('bg-burnt-orange', 'text-parchment', 'font-playfair', 'text-lg', 'font-bold', 'rounded-lg', 'shadow-md', 'hover:bg-opacity-90', 'transition', 'duration-150');
    checkoutButtonContainer.classList.add('w-full', 'h-24'); // Add height for button frame and ensure full width

    paypal.Buttons({
        // Set up the transaction details (required by PayPal)
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount,
                        currency_code: 'USD',
                        breakdown: {
                            item_total: { value: totals.subtotal.toFixed(2), currency_code: 'USD' },
                            shipping: { value: totals.shipping.toFixed(2), currency_code: 'USD' }
                            // Taxes are complex and are excluded for this simple implementation
                        }
                    },
                    items: getCart().map(item => ({
                        name: item.name,
                        unit_amount: { value: item.price.toFixed(2), currency_code: 'USD' },
                        quantity: item.quantity
                    }))
                }]
            });
        },

        // Capture the funds and save the order to Firestore
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Handle successful capture
                return submitOrderToFirestore(details, totals);
            });
        },

        // Handle case where payment is cancelled or an error occurs
        onCancel: function(data) {
            alert('Payment cancelled by user. Returning to cart.');
        },
        onError: function(err) {
            console.error("PayPal Error:", err);
            alert('An error occurred during checkout. Please check the console or try again.');
        }
    }).render(`#${CHECKOUT_BUTTON_ID}`);
}


/**
 * Submits the final order details to the Firestore 'orders' collection.
 * This is called ONLY after a successful PayPal payment capture.
 * @param {Object} paymentDetails - The details returned from PayPal after capture.
 * @param {Object} totals - The calculated cart totals.
 */
async function submitOrderToFirestore(paymentDetails, totals) {
    const cart = getCart();
    const userId = getUserId(); // Null if guest checkout

    // Extract Customer & Shipping Info from PayPal's payload
    const paypalCustomer = paymentDetails.payer;
    // NOTE: paymentDetails.purchase_units[0].shipping is only available if shipping was required and collected by PayPal.
    const paypalShipping = paymentDetails.purchase_units[0].shipping?.address || {};
    const paypalName = paypalCustomer?.name || {};

    // Final Order Object (matches required Firestore structure from Firestore Rules)
    const orderData = {
        userId: userId, // Can be null for guest checkout (permitted by Firestore Rules)
        email: paypalCustomer.email_address,
        status: 'Paid', // Assume Paid upon successful capture
        createdAt: serverTimestamp(),

        totals: {
            subtotal: totals.subtotal,
            shipping: totals.shipping,
            total: totals.total,
        },
        
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
        })),

        customer: {
            firstName: paypalName.given_name || 'Guest',
            lastName: paypalName.surname || '',
            email: paypalCustomer.email_address,
            // Use safe fallbacks for shipping info in case PayPal failed to provide them
            address: paypalShipping.address_line_1 || 'N/A',
            city: paypalShipping.admin_area_2 || 'N/A',
            state: paypalShipping.admin_area_1 || 'N/A',
            zip: paypalShipping.postal_code || 'N/A',
            country: paypalShipping.country_code || 'N/A'
        },

        payment: {
            method: 'PayPal',
            transactionId: paymentDetails.id,
            status: paymentDetails.status,
            // Use optional chaining for safe access to the capture ID
            captureId: paymentDetails.purchase_units[0].payments.captures[0].id
        }
    };

    try {
        // 1. Submit to Firestore (CRITICAL STEP - Validated against Firestore Rules)
        const docRef = await addDoc(collection(db, 'orders'), orderData);

        // 2. Clear local storage
        clearCart(); 

        // 3. Redirect to confirmation page (using the new Order ID)
        window.location.href = `/order-confirmation/?orderId=${docRef.id}`;

    } catch (error) {
        console.error("Error submitting order to Firestore:", error);
        alert("Payment was successful, but there was an error saving your order. Please contact support with your PayPal transaction ID: " + paymentDetails.id);
        // The customer has paid, so we cannot simply fail. We must alert and provide the transaction ID.
    }
}

/**
 * Empty placeholder function to absorb calls from cart.html DOMContentLoaded listener.
 * The actual checkout is now handled by the PayPal SDK.
 */
function handleCheckout() { 
    console.log("handleCheckout: Handled by PayPal SDK via renderPayPalButton.");
}


// --- Initialization ---

/**
 * Initializes the cart system.
 */
function initializeCart() { 
    updateCartDisplay();
    // The call to renderCartDrawer is placed in cart.html's DOMContentLoaded listener 
    // to ensure it runs only when the main cart page is loaded.
}


// --- CRITICAL FIX: Expose core functions globally for the main layout and pages to access ---
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;
window.renderCartDrawer = renderCartDrawer;
window.initializeCart = initializeCart;
window.handleCheckout = handleCheckout; // Keep exported for any legacy use/direct call
window.clearCart = clearCart; // CRITICAL FIX: Expose clearCart for manual reset button

// Add defensive semicolon for stability.
;