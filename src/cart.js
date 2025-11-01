/*
 * Cart Logic (cart.js)
 *
 * This module handles all shopping cart functionality:
 * - Adding/removing items
 * - Updating quantities
 * - Storing/Retrieving from localStorage
 * - Rendering the cart on /cart.html
 * - Calculating totals
 * - Initializing PayPal and handling checkout
 */

// Import all necessary Firebase functions from our central loader
import { 
    db, 
    auth, 
    addDoc, 
    collection, 
    Timestamp 
} from '/firebase-loader.js';

// --- Constants ---
const CART_KEY = 'southernSenseCart';
const SHIPPING_COST = 10.00; // Flat rate shipping
const PAYPAL_CLIENT_ID = 'sb'; // Use 'sb' for sandbox testing

// --- Private Helper Functions ---

/**
 * Retrieves the cart from localStorage.
 * @returns {Array} The array of cart items.
 */
function getCart() {
    try {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error parsing cart from localStorage", e);
        return [];
    }
}

/**
 * Saves the cart to localStorage.
 * @param {Array} cart - The array of cart items to save.
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBubble(); // Update the bubble in the header
}

/**
 * Calculates cart totals.
 * @returns {Object} An object containing { subtotal, total, itemCount }
 */
function calculateTotals() {
    const cart = getCart();
    let subtotal = 0;
    let itemCount = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
    });

    // Shipping is flat rate unless cart is empty
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;

    return { subtotal, total, shipping, itemCount };
}

/**
 * Updates the cart bubble in the header.
 */
function updateCartBubble() {
    const { itemCount } = calculateTotals();
    const bubble = document.getElementById('cart-bubble');
    if (bubble) {
        bubble.textContent = itemCount;
        if (itemCount > 0) {
            bubble.classList.remove('hidden');
        } else {
            bubble.classList.add('hidden');
        }
    }
}

/**
 * Validates the shipping form.
 * @returns {Object|null} An object with customer data, or null if invalid.
 */
function validateCheckoutForm(formErrorElement) {
    const form = document.getElementById('checkout-form');
    formErrorElement.classList.add('hidden'); // Hide error by default

    if (!form.checkValidity()) {
        // Find the first invalid field for a better error message
        const firstInvalid = form.querySelector(':invalid');
        let errorMsg = "Please fill out all required shipping fields.";
        if (firstInvalid) {
            const label = document.querySelector(`label[for="${firstInvalid.id}"]`);
            errorMsg = `Please provide a valid ${label ? label.textContent.toLowerCase() : firstInvalid.name}.`;
        }
        formErrorElement.textContent = errorMsg;
        formErrorElement.classList.remove('hidden');
        firstInvalid.focus();
        return null;
    }

    // All fields are valid, collect the data
    const formData = new FormData(form);
    const customerData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        address: formData.get('address').trim(),
        city: formData.get('city').trim(),
        state: formData.get('state').trim(),
        zip: formData.get('zip').trim(),
    };
    return customerData;
}

// --- Public (Exported) Functions ---

/**
 * Adds an item to the cart.
 * @param {string} id - Product ID
 * @param {string} name - Product Name
 * @param {number} price - Product Price
 * @param {string} imageUrl - Product Image URL
 */
export function addToCart(id, name, price, imageUrl) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }

    saveCart(cart);
    console.log("Item added to cart:", { id, name });
    
    // Show a temporary success message/toast
    // (This could be expanded into a proper modal)
    alert(`${name} has been added to your cart!`);
}

/**
 * Renders the cart items and totals on the cart page.
 */
export function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const loader = document.getElementById('cart-loader');
    const content = document.getElementById('cart-content');
    const empty = document.getElementById('cart-empty');
    
    // Get total elements
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');

    if (!container || !loader || !content || !empty) {
        // We're not on the cart page, so just update the bubble
        updateCartBubble();
        return; 
    }

    // We are on the cart page
    loader.classList.add('hidden');

    if (cart.length === 0) {
        content.classList.add('hidden');
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        content.classList.remove('hidden');
        
        container.innerHTML = ''; // Clear existing items
        
        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            const itemHtml = `
                <div class="flex flex-col md:flex-row items-center bg-white p-4 rounded-lg shadow-md gap-4">
                    <img src="${item.imageUrl || '/logo.webp'}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-xl font-playfair text-charcoal">${item.name}</h3>
                        <p class="text-stone text-sm">Price: $${item.price}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button class="quantity-decrease text-xl font-bold w-8 h-8 rounded-full bg-parchment hover:bg-stone/20" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="w-16 text-center border rounded-lg py-2 quantity-input" data-id="${item.id}">
                        <button class="quantity-increase text-xl font-bold w-8 h-8 rounded-full bg-parchment hover:bg-stone/20" data-id="${item.id}">+</button>
                    </div>
                    <p class="text-lg font-medium text-charcoal w-24 text-right">$${itemTotal}</p>
                    <button class="remove-item text-red-600 hover:text-red-800 text-3xl font-bold" data-id="${item.id}" title="Remove item">&times;</button>
                </div>
            `;
            container.innerHTML += itemHtml;
        });

        // Add event listeners for new buttons
        attachItemListeners();
    }

    // Update totals
    const { subtotal, total, shipping } = calculateTotals();
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    shippingEl.textContent = `$${shipping.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
    
    // Also update the header bubble
    updateCartBubble();
}

/**
 * Attaches event listeners to cart item buttons (remove, +, -).
 */
function attachItemListeners() {
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const cart = getCart().filter(item => item.id !== id);
            saveCart(cart);
            renderCart(); // Re-render the cart
        });
    });

    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', (e) => {
            updateQuantity(e.target.dataset.id, 1);
        });
    });
    
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            updateQuantity(e.target.dataset.id, -1);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value, 10);
            if (isNaN(newQuantity) || newQuantity < 1) {
                e.target.value = 1; // Reset to 1 if invalid
            }
            const cart = getCart();
            const item = cart.find(i => i.id === e.target.dataset.id);
            if (item) {
                item.quantity = Math.max(1, newQuantity); // Ensure at least 1
                saveCart(cart);
                renderCart();
            }
        });
    });
}

/**
 * Updates the quantity of an item in the cart.
 * @param {string} id - The ID of the product to update.
 * @param {number} change - The amount to change (e.g., 1 or -1).
 */
function updateQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            item.quantity = 1; // Don't allow 0 or less
        }
        saveCart(cart);
        renderCart(); // Re-render
    }
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
    saveCart([]);
    renderCart();
    console.log("Cart cleared.");
}

/**
 * Attaches real-time validation listeners to the checkout form.
 */
export function attachFormListeners() {
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('input', () => {
            // As the user types, try to validate.
            // This is a simple way to clear the error message
            // if the user starts fixing the problem.
            const formError = document.getElementById('form-error');
            if (!formError.classList.contains('hidden')) {
                if (form.checkValidity()) {
                    formError.classList.add('hidden');
                }
            }
        });
    }
}

/**
 * Initializes the PayPal SDK and renders the buttons.
 */
export function initPayPal(formErrorElement) {
    const paypalContainer = document.getElementById('paypal-button-container');
    const paypalLoader = document.getElementById('paypal-loader');

    if (!paypalContainer) return;

    paypalLoader.classList.remove('hidden');

    paypal.Buttons({
        // --- createOrder ---
        // This is called when the user clicks the PayPal button.
        createOrder: async (data, actions) => {
            console.log("PayPal createOrder started...");
            // 1. Validate the form
            const customerData = validateCheckoutForm(formErrorElement);
            if (!customerData) {
                console.log("Form validation failed.");
                return actions.reject(); // Stop the transaction
            }
            
            // 2. Calculate totals
            const { total, subtotal, shipping } = calculateTotals();
            const cart = getCart();

            // 3. Create the order payload for PayPal
            const purchase_units = [{
                amount: {
                    value: total.toFixed(2),
                    currency_code: 'USD',
                    breakdown: {
                        item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
                        shipping: { currency_code: 'USD', value: shipping.toFixed(2) }
                    }
                },
                items: cart.map(item => ({
                    name: item.name,
                    unit_amount: { currency_code: 'USD', value: item.price },
                    quantity: item.quantity,
                    sku: item.id
                })),
                shipping: {
                    name: {
                        full_name: `${customerData.firstName} ${customerData.lastName}`
                    },
                    address: {
                        address_line_1: customerData.address,
                        admin_area_2: customerData.city,
                        admin_area_1: customerData.state,
                        postal_code: customerData.zip,
                        country_code: 'US'
                    }
                }
            }];

            // 4. Create the full order object for our Firestore database
            const orderData = {
                customer: customerData,
                items: cart,
                totals: { subtotal, shipping, total },
                status: 'Pending', // Will be 'Paid' after approval
                createdAt: Timestamp.now(),
                paypalOrderId: null // Will be set on approval
            };

            // 5. Save the 'Pending' order to Firestore
            try {
                const orderRef = await addDoc(collection(db, "orders"), orderData);
                console.log("Pending order saved to Firestore with ID:", orderRef.id);
                // Store the Firestore order ID to use in onApprove
                paypalContainer.dataset.firestoreOrderId = orderRef.id; 
            } catch (e) {
                console.error("Error saving pending order to Firestore:", e);
                formErrorElement.textContent = "Could not start checkout. Please try again.";
                formErrorElement.classList.remove('hidden');
                return actions.reject();
            }
            
            // 6. Create the order with PayPal
            return actions.order.create({
                purchase_units: purchase_units,
                application_context: {
                    shipping_preference: 'SET_PROVIDED_ADDRESS'
                }
            });
        },

        // --- onApprove ---
        // This is called after the user successfully authorizes the payment.
        onApprove: async (data, actions) => {
            console.log("PayPal onApprove started...");
            try {
                const details = await actions.order.capture();
                console.log("Payment successful:", details);

                const firestoreOrderId = paypalContainer.dataset.firestoreOrderId;
                if (!firestoreOrderId) {
                    throw new Error("No Firestore order ID found.");
                }

                // 1. Update the order in Firestore to 'Paid'
                const orderRef = doc(db, 'orders', firestoreOrderId);
                await updateDoc(orderRef, {
                    status: 'Paid',
                    paypalOrderId: details.id,
                    paypalCaptureDetails: details // Save the full receipt
                });
                console.log("Firestore order updated to 'Paid'.");
                
                // 2. THIS IS THE FIX: Clear the cart
                clearCart();
                
                // 3. THIS IS THE FIX: Redirect to the confirmation page
                // We pass the Firestore Order ID so the page can look it up
                window.location.href = `/order-confirmation/?orderId=${firestoreOrderId}`;

            } catch (err) {
                console.error("Error capturing payment or updating order:", err);
                formErrorElement.textContent = "Payment failed after approval. Please contact support.";
                formErrorElement.classList.remove('hidden');
            }
        },

        // --- onError ---
        // This is called if an error occurs during the PayPal flow
        onError: (err) => {
            console.error("PayPal Error:", err);
            formErrorElement.textContent = "An error occurred with the payment. Please try again.";
            formErrorElement.classList.remove('hidden');
        },

        // --- onCancel ---
        // This is called if the user cancels the payment
        onCancel: (data) => {
            console.log("PayPal payment cancelled.", data);
            // Optionally remove the 'Pending' order from Firestore
            // For now, we'll leave it
        }

    }).render(paypalContainer).then(() => {
        // Hide loader once buttons are rendered
        paypalLoader.classList.add('hidden');
    }).catch((err) => {
        console.error("Failed to render PayPal buttons:", err);
        paypalLoader.classList.add('hidden');
        paypalContainer.innerHTML = "<p class='text-red-600 text-center'>Error loading payment options. Please refresh.</p>";
    });
}

// --- Initialize Bubble on Load ---
// This runs on every page load to ensure the header
// bubble is always up-to-date.
document.addEventListener('DOMContentLoaded', updateCartBubble);
