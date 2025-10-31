// src/auth.js
// Manages all user authentication, registration, and account page logic.

import { db, auth } from './firebase-loader.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const USERS_COLLECTION = "users";
let userId = null;
let appId = 'default-app-id';

/**
 * Initializes all auth-related forms on the page.
 * This is called by firebase-loader.js once auth state is confirmed.
 * @param {User | null} user The current Firebase user object, or null.
 */
export function initializeAuth(user) {
  userId = user ? user.uid : null;
  appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  
  // Update UI based on login state
  updateAuthUI(user);

  // Attach listeners for auth forms
  attachRegisterFormListener();
  attachLoginFormListener();
  attachLogoutButtonListener();
  attachPasswordResetFormListener();

  // If we are on the account page, load user data
  if (document.getElementById('account-details-container') && user) {
    loadAccountDetails(user);
    loadUserOrders(user);
  } else if (document.getElementById('account-details-container') && !user) {
    // If user is not logged in but on the account page, redirect to login
    // This is a defensive check; firebase-loader should have redirected already.
    console.warn("Not logged in, redirecting from account page.");
    window.location.href = 'login.html';
  }
}

/**
 * Updates the header UI to show "My Account" or "Login"
 * @param {User | null} user The current Firebase user object, or null.
 */
function updateAuthUI(user) {
  const loginLink = document.getElementById('auth-login-link');
  const logoutLink = document.getElementById('auth-logout-link');

  if (loginLink && logoutLink) {
    if (user) {
      // User is logged in
      loginLink.classList.add('hidden');
      logoutLink.classList.remove('hidden');
    } else {
      // User is logged out
      loginLink.classList.remove('hidden');
      logoutLink.classList.add('hidden');
    }
  }
}

/**
 * Attaches the event listener for the registration form.
 */
function attachRegisterFormListener() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = registerForm.firstName.value;
    const lastName = registerForm.lastName.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const passwordConfirm = registerForm.passwordConfirm.value;

    if (password !== passwordConfirm) {
      showAuthError("register-error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's Firebase Auth profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create a user document in Firestore to store additional details
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/${USERS_COLLECTION}/profile`);
      await setDoc(userDocRef, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        createdAt: new Date().toISOString()
      });

      console.log("User registered and profile created in Firestore.");
      // Redirect to the account page
      window.location.href = 'account.html';

    } catch (error) {
      console.error("Registration Error:", error);
      showAuthError("register-error", getFriendlyAuthError(error));
    }
  });
}

/**
 * Attaches the event listener for the login form.
 */
function attachLoginFormListener() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener in firebase-loader.js will handle redirect
      // to 'account.html' or previous page.
      console.log("User logged in.");
      // For login page, we explicitly redirect to account
      window.location.href = 'account.html';
    } catch (error) {
      console.error("Login Error:", error);
      showAuthError("login-error", getFriendlyAuthError(error));
    }
  });
}

/**
 * Attaches the event listener for the logout button.
 */
function attachLogoutButtonListener() {
  const logoutButton = document.getElementById('auth-logout-button'); // On account page
  const logoutLink = document.getElementById('auth-logout-link'); // In header

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
      // Redirect to homepage
      window.location.href = 'index.html';
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  if (logoutButton) {
    logoutButton.addEventListener('click', handleSignOut);
  }
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault(); // It's a link, so prevent navigation
      handleSignOut();
    });
  }
}

/**
 * Attaches the event listener for the password reset form.
 */
function attachPasswordResetFormListener() {
  const resetForm = document.getElementById('password-reset-form');
  if (!resetForm) return;

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = resetForm.email.value;

    try {
      await sendPasswordResetEmail(auth, email);
      showAuthError("reset-success", "Password reset email sent. Check your inbox.", "success");
      resetForm.reset();
    } catch (error) {
      console.error("Password Reset Error:", error);
      showAuthError("reset-error", getFriendlyAuthError(error));
    }
  });
}

/**
 * Loads and displays the user's details on the "My Account" page.
 * @param {User} user The authenticated Firebase user object.
 */
async function loadAccountDetails(user) {
  const container = document.getElementById('account-details-container');
  if (!container) return;

  // 1. Get display name from Auth profile
  const welcomeElement = document.getElementById('account-welcome');
  if (welcomeElement && user.displayName) {
    welcomeElement.textContent = `Welcome, ${user.displayName.split(' ')[0]}!`;
  } else if (welcomeElement) {
    welcomeElement.textContent = `Welcome!`;
  }

  // 2. Get detailed profile from Firestore
  try {
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/${USERS_COLLECTION}/profile`);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('account-name').textContent = `${data.firstName} ${data.lastName}`;
      document.getElementById('account-email').textContent = data.email;
    } else {
      // Fallback to auth data if Firestore profile is missing
      console.warn("No Firestore profile found, using auth data.");
      document.getElementById('account-name').textContent = user.displayName || "N/A";
      document.getElementById('account-email').textContent = user.email;
    }
  } catch (error) {
    console.error("Error loading user profile from Firestore:", error);
    container.innerHTML = "<p class='text-red-600'>Could not load account details.</p>";
  }
}

/**
 * Loads and displays the user's order history on the "My Account" page.
 * @param {User} user The authenticated Firebase user object.
 */
async function loadUserOrders(user) {
  const container = document.getElementById('order-history-container');
  if (!container) return;

  container.innerHTML = "<p class='text-stone'>Loading order history...</p>";

  try {
    // Path to the user's private orders collection
    const ordersPath = `artifacts/${appId}/users/${user.uid}/orders`;
    const ordersRef = collection(db, ordersPath);
    
    // Query for orders
    // Note: We avoid orderBy('orderDate', 'desc') to prevent needing a composite index.
    // We will sort in JavaScript.
    const q = query(ordersRef);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p class='text-stone'>You have not placed any orders yet.</p>";
      return;
    }

    let orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date descending in JavaScript
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Render orders
    container.innerHTML = ''; // Clear "Loading..."
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate).toLocaleDateString();
      const orderElement = document.createElement('div');
      orderElement.className = "border border-stone/20 rounded-lg p-4 mb-4";
      orderElement.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-semibold text-charcoal">Order #${order.id.substring(0, 8)}...</h4>
          <span class="text-sm text-stone">${order.status || 'Processing'}</span>
        </div>
        <p class="text-sm text-stone mb-2">Placed on: ${orderDate}</p>
        <p class="text-base font-medium text-charcoal mb-4">Total: $${parseFloat(order.totalAmount).toFixed(2)}</p>
        <ul class="space-y-2">
          ${order.items.map(item => `
            <li class="flex items-center space-x-3">
              <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 rounded-md object-cover border border-stone/10">
              <div class="flex-1">
                <p class="text-sm font-medium text-charcoal">${item.name}</p>
                <p class="text-sm text-stone">Qty: ${item.quantity}</p>
              </div>
              <p class="text-sm text-stone">$${parseFloat(item.price).toFixed(2)}</p>
            </li>
          `).join('')}
        </ul>
      `;
      container.appendChild(orderElement);
    });

  } catch (error) {
    console.error("Error loading order history:", error);
    container.innerHTML = "<p class='text-red-600'>Could not load order history.</p>";
  }
}

/**
 * Displays an auth-related error message on the form.
 * @param {string} elementId The ID of the error message element.
 *s* @param {string} message The error message to display.
 * @param {'error' | 'success'} type The type of message.
 */
function showAuthError(elementId, message, type = 'error') {
  const errorElement = document.getElementById(elementId);
  if (!errorElement) return;

  errorElement.textContent = message;
  
  if (type === 'error') {
    errorElement.classList.remove('text-green-600');
    errorElement.classList.add('text-red-600');
  } else {
    errorElement.classList.remove('text-red-600');
    errorElement.classList.add('text-green-600');
  }
  
  errorElement.classList.remove('hidden');
}

/**
 * Converts Firebase auth error codes into friendly messages.
 * @param {Error} error The Firebase auth error.
 * @returns {string} A user-friendly error message.
 */
function getFriendlyAuthError(error) {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
