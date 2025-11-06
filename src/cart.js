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
 * @param {string} productId - The ID of the product to remove.
 */
function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartDrawer();
    updateCartDisplay();
}


// --- UI Functions ---

/**
 * Updates the cart item count in the header/navigation.
 */
function updateCartDisplay() { // Removed export
    const cart = getCart();
    const totalItems = cart.reduce((count, item) => count + (item.quantity || 0), 0);

    const cartCountElements = document.querySelectorAll('.cart-item-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        if (totalItems > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

/**
 * Renders the cart contents in the full `cart.html` page (or the slide-out drawer).
 */
function renderCartDrawer() { // Removed export
    const cart = getCart();
    const totals = calculateTotals(cart);
    const cartContainer = document.getElementById('cart-items-container');
    const statusMessage = document.getElementById('cart-status-message');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    if (cartContainer) {
        cartContainer.innerHTML = ''; // Clear previous content

        if (cart.length === 0) {
            statusMessage?.classList.remove('hidden');
            if (checkoutButton) checkoutButton.disabled = true;
        } else {
            statusMessage?.classList.add('hidden');
            if (checkoutButton) checkoutButton.disabled = false;
        }

        cart.forEach(item => {
            // FIX: Ensure price is a number before calculation
            const price = parseFloat(item.price);
            const quantity = item.quantity || 0;
            const itemTotal = (price * quantity).toFixed(2);
            const priceDisplay = price.toFixed(2);

            const itemHtml = `
                <div class="flex items-center space-x-4 border-b border-stone/10 last:border-b-0 py-3">
                    <img src="${item.imageUrl.startsWith('http') ? item.imageUrl : '/src/' + item.imageUrl}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
                    
                    <div class="flex-grow">
                        <p class="font-medium text-charcoal">${item.name}</p>
                        <p class="text-sm text-stone">$${priceDisplay} each</p>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                        <input type="number" 
                               data-product-id="${item.id}" 
                               value="${quantity}" 
                               min="1" 
                               class="cart-quantity-input w-16 p-2 border border-stone/30 rounded-lg text-center text-charcoal">
                        <span class="font-bold text-charcoal w-16 text-right">$${itemTotal}</span>
                    </div>

                    <button data-product-id="${item.id}" class="remove-item-button text-red-600 hover:text-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            cartContainer.innerHTML += itemHtml;
        });
        
        // Update totals display
        if (subtotalEl) subtotalEl.textContent = totals.subtotal.toFixed(2);
        if (totalEl) totalEl.textContent = totals.total.toFixed(2);

        // Attach event listeners after rendering
        document.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.dataset.productId;
                const newQuantity = parseInt(e.target.value, 10);
                updateItemQuantity(productId, newQuantity);
            });
        });

        document.querySelectorAll('.remove-item-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                removeItem(productId);
            });
        });

        // Checkout button listener (event listener is now attached in cart.html for clarity)
    }


// --- Checkout Logic (Firestore Interaction) ---

/**
 * Handles the final checkout process: collecting user data, creating a Firestore order, and clearing the cart.
 */
function handleCheckout() { // Removed export
    const cart = getCart();
    if (cart.length === 0) return;

    const totals = calculateTotals(cart);
    const user = auth.currentUser;
    const checkoutButton = document.getElementById('checkout-button');

    // FIX: Simplified checkout process uses prompts for necessary customer info
    const customerName = prompt("Please enter your Full Name:");
    if (!customerName || customerName.trim() === '') return;

    const customerEmail = prompt("Please enter your email for the order confirmation:");
    if (!customerEmail || !customerEmail.includes('@')) return;

    const customerAddress = prompt("Please enter your full shipping address (Street, City, State, Zip):");
    if (!customerAddress || customerAddress.trim() === '') return;
    
    // Disable button and show loading state
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Processing...';

    // Parse name and address inputs (simplistic parsing for demo/base function)
    const nameParts = customerName.split(' ');
    const firstName = nameParts.shift();
    const lastName = nameParts.join(' ');

    const addressParts = customerAddress.split(',').map(p => p.trim());
    const addressLine = addressParts[0] || customerAddress;
    
    // Attempt to parse city/state/zip from the rest
    let city = addressParts[1] || '';
    let state = '';
    let zip = '';
    
    if (addressParts.length > 2) {
        const stateZip = addressParts[2].trim().split(/\s+/);
        state = stateZip[0] || '';
        zip = stateZip[1] || '';
    }

    try {
        
        // 1. Construct the base order data
        let orderData = {
            email: customerEmail,
            items: cart,
            totals: totals,
            customer: {
                firstName: firstName,
                lastName: lastName,
                email: customerEmail, 
                address: addressLine, 
                city: city,
                state: state,
                zip: zip,
            },
            status: 'Pending', 
            paymentMethod: 'Simulated Payment',
            createdAt: serverTimestamp() 
        };
        
        // 2. CRITICAL FIX: Conditionally add userId only if authenticated.
        // This prevents the field from existing for guest checkouts, satisfying the Firestore rule (Rule 59-60).
        if (user) {
            orderData.userId = user.uid;
        }

        const docRef = addDoc(collection(db, "orders"), orderData);

        // Clear local storage cart and update UI
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartDisplay();
        
        // CRITICAL FIX: Redirect to the standardized confirmation page URL
        window.location.href = `/order-confirmation/?orderId=${docRef.id}`;

    } catch (error) {
        console.error("Checkout failed:", error);
        alert("Checkout Failed. Please check the console for details.");
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Checkout';
    }
}


// --- Initialization ---

/**
 * Initializes cart functionality globally (called by layout.html's DOMContentLoaded).
 * FIX: Removed redundant DOMContentLoaded wrapper.
 */
function initializeCart() { // Removed export
    // Update the cart count on every page load
    updateCartDisplay(); 
    
    // Setup listener for the cart button in the header (if present)
    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) {
        cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            // CRITICAL FIX: Redirect to the clean URL /cart/
            window.location.href = '/cart/'; 
        });
    }
}

// ULTIMATE FIX: Expose core functions to the global window object.
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;
window.handleCheckout = handleCheckout;
window.renderCartDrawer = renderCartDrawer;
window.initializeCart = initializeCart;

; // DEFENSIVE SEMICOLON: Added to absorb potential file truncation errors.