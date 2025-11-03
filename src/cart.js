/*
 * cart.js
 * Manages client-side shopping cart state (localStorage) and core functions.
 * Exports: addToCart, updateCartDisplay, renderCartDrawer, initializeCart, checkout
 */

// FIX: Corrected import path to reference the file in the /src/ directory
import { 
    db, 
    collection, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc, 
    updateDoc, 
    auth 
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
        return sum + (price * item.quantity);
    }, 0);

    // Calculate shipping based on cart content (can be simplified to flat rate)
    const shipping = subtotal > 0 ? SHIPPING_RATE : 0.00; // Only charge shipping if there are items

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
export function addToCart(product, quantity = 1) {
    if (!product || !product.id) {
        console.error("Cannot add to cart: Invalid product object.");
        return;
    }

    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Item is new, add it to the cart
        const newItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
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
export function updateCartDisplay() {
    const cart = getCart();
    const totalItems = cart.reduce((count, item) => count + item.quantity, 0);

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
 * The logic is designed to work for both a dedicated page and a reusable drawer element.
 */
export function renderCartDrawer() {
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
            checkoutButton.disabled = true;
        } else {
            statusMessage?.classList.add('hidden');
            checkoutButton.disabled = false;
        }

        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            const priceDisplay = parseFloat(item.price).toFixed(2);

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
                               value="${item.quantity}" 
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

        // Checkout button listener (redirects to the dedicated checkout page or executes checkout logic)
        checkoutButton?.addEventListener('click', handleCheckout);
    }
}


// --- Checkout Logic (Firestore Interaction) ---

/**
 * Handles the final checkout process: collecting user data, creating a Firestore order, and clearing the cart.
 */
async function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) return;

    const totals = calculateTotals(cart);
    const user = auth.currentUser;
    const checkoutButton = document.getElementById('checkout-button');

    // FIX: Simplified checkout to focus on core function and order creation
    // In a real app, this would redirect to a detailed payment form first.
    // For now, we simulate a simple checkout using a prompt for customer info.
    const customerEmail = prompt("Please enter your email for the order confirmation:");
    if (!customerEmail) return;

    const customerAddress = prompt("Please enter your full shipping address (Street, City, State, Zip):");
    if (!customerAddress) return;
    
    // Disable button and show loading state
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Processing...';

    // Parse simple address input (basic attempt)
    const addressParts = customerAddress.split(',');
    const address = addressParts[0]?.trim() || customerAddress;

    try {
        const orderData = {
            // Include userId only if authenticated for Firestore Rules
            userId: user ? user.uid : null, 
            email: customerEmail,
            items: cart,
            totals: totals,
            customer: {
                // Simplified customer data for this scope
                email: customerEmail, 
                address: address, 
                city: addressParts[1]?.trim() || '',
                state: addressParts[2]?.trim().split(' ')[0] || '',
                zip: addressParts[2]?.trim().split(' ')[1] || '',
            },
            status: 'Pending', 
            paymentMethod: 'Simulated Payment',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);

        // Clear local storage cart and update UI
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartDisplay();
        
        // Redirect to the confirmation page with the new Order ID
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
 * Initializes cart functionality globally (used in layout.html).
 */
export function initializeCart() {
    document.addEventListener('DOMContentLoaded', () => {
        // Update the cart count on every page load
        updateCartDisplay(); 
        
        // Setup listener for the cart button in the header (if present)
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                // Simple redirect to the dedicated cart page
                window.location.href = '/cart.html'; 
            });
        }
    });
}