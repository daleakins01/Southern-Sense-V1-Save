// src/cart.js
// Manages shopping cart functionality using Firestore.

// We get db and auth from the firebase-loader, which is imported in the <head>
// and guaranteed to run before this module.
import { db, auth } from './firebase-loader.js';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  increment,
  deleteField,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firestore collection name
const CART_COLLECTION = "carts";
let cart = {}; // Local cache of the user's cart
let userId = null;
let cartRef = null;

/**
 * Initializes the cart, sets up the Firestore listener, and updates the UI.
 * This is called by firebase-loader.js once auth is ready.
 * @param {string} uid The authenticated user's ID.
 */
export function initializeCart(uid) {
  if (!uid) {
    console.error("Cart Error: User ID is null. Cart cannot be initialized.");
    // Handle guest cart logic if needed, e.g., using localStorage
    loadCartFromLocalStorage();
    updateCartUI();
    return;
  }
  
  userId = uid;
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  // Path to the user's private cart document
  const cartDocPath = `artifacts/${appId}/users/${userId}/${CART_COLLECTION}/user_cart`;
  cartRef = doc(db, cartDocPath);

  console.log(`Initializing cart listener for user ${userId} at path ${cartDocPath}`);

  // Set up a real-time listener for cart changes
  onSnapshot(cartRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      cart = data.items || {}; // The cart items are stored in an 'items' map
      console.log("Cart updated from Firestore:", cart);
    } else {
      // No cart document exists, so we have an empty cart.
      console.log("No cart document found. Local cart is empty.");
      cart = {};
    }
    // After syncing with Firestore, merge any localStorage cart items
    mergeLocalStorageCart();
    updateCartUI();
  }, (error) => {
    console.error("Error listening to cart:", error);
    // If Firestore fails, fall back to localStorage
    loadCartFromLocalStorage();
    updateCartUI();
  });
}

/**
 * Updates the cart icon count and any other cart-related UI elements.
 */
function updateCartUI() {
  const cartItemCountElement = document.getElementById('cart-item-count');
  if (!cartItemCountElement) {
    // This can happen if cart.js runs before header.html is loaded.
    // main.js will call this again once auth is ready.
    return;
  }

  let totalItems = 0;
  for (const productId in cart) {
    totalItems += cart[productId].quantity;
  }

  console.log(`Updating cart UI: ${totalItems} items`);

  if (totalItems > 0) {
    cartItemCountElement.textContent = totalItems;
    cartItemCountElement.classList.remove('hidden');
  } else {
    cartItemCountElement.classList.add('hidden');
  }

  // If we are on the cart page, update the cart items display
  if (document.getElementById('cart-items-container')) {
    displayCartItems();
  }
}

/**
 * Adds an item to the cart in Firestore.
 * @param {string} productId The unique ID of the product.
 * @param {string} name The product name.
 * @param {number} price The product price.
 * @param {string} imageUrl The product image URL.
 */
export async function addToCart(productId, name, price, imageUrl) {
  if (!productId || !name || price == null || !imageUrl) {
    console.error("addToCart failed: Missing product details.", { productId, name, price, imageUrl });
    showCartNotification("Error adding item. Please try again.", "error");
    return;
  }

  // Optimistically update local cart
  const existingItem = cart[productId];
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart[productId] = {
      name: name,
      price: price,
      imageUrl: imageUrl,
      quantity: 1
    };
  }
  updateCartUI(); // Show immediate feedback
  saveCartToLocalStorage(); // Save to local storage for guest/backup

  // Update Firestore
  if (cartRef) {
    try {
      // Use dot notation to update a specific field in the 'items' map
      const itemUpdate = {};
      itemUpdate[`items.${productId}.name`] = name;
      itemUpdate[`items.${productId}.price`] = price;
      itemUpdate[`items.${productId}.imageUrl`] = imageUrl;
      // Atomically increment the quantity
      itemUpdate[`items.${productId}.quantity`] = increment(1);

      // setDoc with merge: true will create the doc if it doesn't exist
      // or update it if it does.
      await setDoc(cartRef, itemUpdate, { merge: true });
      
      console.log(`Item ${productId} added/incremented in Firestore.`);
      showCartNotification(`Added ${name} to cart!`, "success");
    } catch (error) {
      console.error("Error adding item to Firestore:", error);
      showCartNotification("Error syncing cart. Item saved locally.", "error");
      // Revert optimistic update if Firestore fails?
      // For now, we'll leave it, as it's saved locally.
    }
  } else {
    console.warn("User not authenticated. Item saved to local storage only.");
    showCartNotification(`Added ${name} to cart! (Saved locally)`);
  }
}

/**
 * Updates the quantity of an item in the cart.
 * @param {string} productId The product ID.
 * @param {number} newQuantity The new quantity.
 */
export async function updateCartItemQuantity(productId, newQuantity) {
  newQuantity = parseInt(newQuantity, 10);

  if (isNaN(newQuantity) || newQuantity < 0) {
    console.error("Invalid quantity:", newQuantity);
    return;
  }

  if (newQuantity === 0) {
    // Remove the item if quantity is zero
    await removeCartItem(productId);
    return;
  }

  // Optimistic local update
  if (cart[productId]) {
    cart[productId].quantity = newQuantity;
  }
  updateCartUI();
  saveCartToLocalStorage();

  // Firestore update
  if (cartRef) {
    try {
      const itemUpdate = {};
      itemUpdate[`items.${productId}.quantity`] = newQuantity;
      await updateDoc(cartRef, itemUpdate);
      console.log(`Updated quantity for ${productId} in Firestore.`);
    } catch (error) {
      console.error("Error updating item quantity in Firestore:", error);
    }
  }
}

/**
 * Removes an item from the cart completely.
 * @param {string} productId The product ID to remove.
 */
export async function removeCartItem(productId) {
  // Optimistic local update
  if (cart[productId]) {
    delete cart[productId];
  }
  updateCartUI();
  saveCartToLocalStorage();

  // Firestore update
  if (cartRef) {
    try {
      // Use deleteField() to remove a specific key from the 'items' map
      const itemRemovalUpdate = {};
      itemRemovalUpdate[`items.${productId}`] = deleteField();
      await updateDoc(cartRef, itemRemovalUpdate);
      console.log(`Removed item ${productId} from Firestore.`);
    } catch (error) {
      console.error("Error removing item from Firestore:", error);
    }
  }
}

/**
 * Renders the cart items on the cart page.
 */
function displayCartItems() {
  const container = document.getElementById('cart-items-container');
  const subtotalElement = document.getElementById('cart-subtotal');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartCheckoutSection = document.getElementById('cart-checkout-section');
  
  if (!container || !subtotalElement || !emptyCartMessage || !cartCheckoutSection) {
    console.warn("Cart page elements not found. Skipping render.");
    return;
  }

  container.innerHTML = ''; // Clear existing items
  let subtotal = 0;
  const productIds = Object.keys(cart);

  if (productIds.length === 0) {
    emptyCartMessage.classList.remove('hidden');
    cartCheckoutSection.classList.add('hidden');
    return;
  }

  emptyCartMessage.classList.add('hidden');
  cartCheckoutSection.classList.remove('hidden');

  productIds.forEach(productId => {
    const item = cart[productId];
    if (!item || !item.quantity || !item.price) {
      console.warn(`Skipping malformed cart item: ${productId}`, item);
      return;
    }

    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const itemElement = document.createElement('li');
    itemElement.className = "flex py-6";
    itemElement.innerHTML = `
      <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-stone/20">
        <img src="${item.imageUrl}" alt="${item.name}" class="h-full w-full object-cover object-center">
      </div>
      <div class="ml-4 flex flex-1 flex-col">
        <div>
          <div class="flex justify-between text-base font-medium text-charcoal">
            <h3>
              <a href="product.html?id=${productId}">${item.name}</a>
            </h3>
            <p class="ml-4">$${itemTotal.toFixed(2)}</p>
          </div>
        </div>
        <div class="flex flex-1 items-end justify-between text-sm">
          <div class="flex items-center">
            <label for="quantity-${productId}" class="mr-2 text-stone">Qty</label>
            <input id="quantity-${productId}" name="quantity-${productId}" type="number" min="0" value="${item.quantity}" 
                   class="w-16 rounded-md border border-stone/30 text-center text-charcoal shadow-sm focus:border-stone focus:ring-stone sm:text-sm"
                   data-product-id="${productId}">
          </div>
          <div class="flex">
            <button type="button" class="font-medium text-burnt-orange hover:text-red-700" data-product-id="${productId}">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(itemElement);
  });

  // Add event listeners for new quantity/remove buttons
  container.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.productId;
      const newQuantity = parseInt(e.target.value, 10);
      updateCartItemQuantity(id, newQuantity);
    });
  });

  container.querySelectorAll('button[data-product-id]').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.productId;
      removeCartItem(id);
    });
  });

  // Update subtotal
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
}

/**
 * Returns the current cart object. Used by checkout.
 */
export function getCart() {
  return cart;
}

/**
 * Clears the entire cart, both locally and in Firestore.
 */
export async function clearCart() {
  cart = {};
  updateCartUI();
  localStorage.removeItem('localCart');

  if (cartRef) {
    try {
      // Set the 'items' field to an empty map
      await setDoc(cartRef, { items: {} });
      console.log("Cart cleared in Firestore.");
    } catch (error) {
      console.error("Error clearing cart in Firestore:", error);
    }
  }
}

// --- LocalStorage Guest Cart ---

/**
 * Saves the current local 'cart' object to localStorage.
 */
function saveCartToLocalStorage() {
  try {
    localStorage.setItem('localCart', JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart to localStorage:", e);
  }
}

/**
 * Loads the cart from localStorage into the local 'cart' object.
 */
function loadCartFromLocalStorage() {
  try {
    const localData = localStorage.getItem('localCart');
    if (localData) {
      cart = JSON.parse(localData);
      console.log("Cart loaded from localStorage:", cart);
    }
  } catch (e) {
    console.error("Failed to load cart from localStorage:", e);
    cart = {};
  }
}

/**
 * Merges the localStorage cart with the Firestore cart when a user logs in.
 * Firestore cart takes precedence.
 */
async function mergeLocalStorageCart() {
  if (!cartRef) return; // Not logged in, nothing to merge

  const localData = localStorage.getItem('localCart');
  if (!localData) return; // No local cart, nothing to merge

  try {
    const localCart = JSON.parse(localData);
    if (Object.keys(localCart).length === 0) {
      localStorage.removeItem('localCart');
      return;
    }

    console.log("Merging local cart into Firestore cart...");
    
    // Use a batch write to merge all items at once
    const batch = writeBatch(db);
    
    // 'cart' is the Firestore cart, 'localCart' is from localStorage
    const mergedCart = { ...cart }; // Start with Firestore data
    let itemsMerged = false;

    for (const productId in localCart) {
      const localItem = localCart[productId];
      const firestoreItem = mergedCart[productId];

      if (firestoreItem) {
        // Item exists in both. Firestore wins quantity.
        // We'll just ignore the local one.
      } else {
        // Item only exists locally. Add it to Firestore.
        mergedCart[productId] = localItem; // Add to our local cache
        
        // Add to batch
        const itemUpdate = {};
        itemUpdate[`items.${productId}.name`] = localItem.name;
        itemUpdate[`items.${productId}.price`] = localItem.price;
        itemUpdate[`items.${productId}.imageUrl`] = localItem.imageUrl;
        itemUpdate[`items.${productId}.quantity`] = localItem.quantity;
        
        // Use setDoc with merge to add this new item to the map
        batch.set(cartRef, itemUpdate, { merge: true });
        itemsMerged = true;
      }
    }

    if (itemsMerged) {
      await batch.commit();
      console.log("Successfully merged local cart into Firestore.");
    }

    // Clear local storage cart after successful merge
    localStorage.removeItem('localCart');
    cart = mergedCart; // Update our main local cart object
    updateCartUI(); // Update UI with merged cart
    
  } catch (e) {
    console.error("Failed to merge local cart:", e);
  }
}

// --- Notifications ---

/**
 * Shows a temporary notification message.
 * @param {string} message The message to display.
 * @param {'success' | 'error'} type The type of notification.
 */
function showCartNotification(message, type = 'success') {
  const notificationElement = document.getElementById('cart-notification');
  if (!notificationElement) {
    console.log("Cart Notification:", message);
    return;
  }

  const textElement = notificationElement.querySelector('p');
  if (!textElement) return;

  textElement.textContent = message;

  // Set color based on type
  if (type === 'error') {
    notificationElement.classList.remove('bg-green-600');
    notificationElement.classList.add('bg-red-600');
  } else {
    notificationElement.classList.remove('bg-red-600');
    notificationElement.classList.add('bg-green-600');
  }

  // Show notification
  notificationElement.classList.remove('opacity-0', '-translate-y-full');
  notificationElement.classList.add('opacity-100', 'translate-y-0');

  // Hide after 3 seconds
  setTimeout(() => {
    notificationElement.classList.remove('opacity-100', 'translate-y-0');
    notificationElement.classList.add('opacity-0', '-translate-y-full');
  }, 3000);
}

// Listen for a custom event to add items (decouples from product page)
document.addEventListener('addToCart', (e) => {
  const { productId, name, price, imageUrl } = e.detail;
  addToCart(productId, name, price, imageUrl);
});
