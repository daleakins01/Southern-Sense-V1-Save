// src/auth.js
// Manages all user authentication, registration, and account page logic.

// --- Imports ---
// We get db and auth from our central firebase-loader.
// We import the specific functions we need for auth and firestore.
import { db, auth } from './firebase-loader.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Global UI Elements ---
// We query for these elements. If they don't exist on the current page,
// the listeners will simply not attach, which is safe.
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const accountDetails = document.getElementById('account-details');
const signOutButton = document.getElementById('sign-out-button');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// --- Utility Functions ---

/**
 * Displays an error message in the form.
 * @param {string} message - The error message to display.
 */
function showFormError(message) {
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
  }
}

/**
 * Toggles the loading spinner on a form button.
 * @param {boolean} isLoading - Whether to show the spinner.
 */
function setFormLoading(isLoading) {
  // We need to find the *specific* button for the current form.
  const currentForm = loginForm || registerForm;
  if (!currentForm) return;

  const btnText = currentForm.querySelector('#button-text');
  const btnSpinner = currentForm.querySelector('#button-spinner');
  const btn = currentForm.querySelector('button[type="submit"]');

  if (!btnText || !btnSpinner || !btn) return;

  if (isLoading) {
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btn.disabled = true;
  } else {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    btn.disabled = false;
  }
}

// --- Event Listeners ---

/**
 * Attaches the listener for the registration form submission.
 */
function attachRegisterFormListener() {
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    const firstName = registerForm.firstName.value;
    const lastName = registerForm.lastName.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore to store additional details
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: `${firstName} ${lastName}`,
        email: email,
        createdAt: new Date().toISOString()
      });

      console.log("User registered and profile created in Firestore.");
      // Redirect to the account page.
      // The global auth listener in firebase-loader.js will also catch this,
      // but we redirect explicitly for a faster user experience.
      // FIX 8.1: Changed redirect path to use trailing slash
      window.location.href = '/account/';

    } catch (error) {
      console.error("Registration Error:", error);
      showFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  });
}

/**
 * Attaches the listener for the login form submission.
 */
function attachLoginFormListener() {
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in.");
      // For login page, we explicitly redirect to account
      // FIX 8.1: Changed redirect path to use trailing slash
      window.location.href = '/account/';
    } catch (error) {
      console.error("Login Error:", error);
      showFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  });
}

/**
 * Loads and displays user account details.
 * This is called *only* on the account page.
 */
async function loadAccountDetails() {
  if (!accountDetails) return;

  const user = auth.currentUser;
  // The global auth listener in firebase-loader.js should have already
  // redirected non-users away, but we double-check.
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('user-name').textContent = userData.name || 'Valued Customer';
        document.getElementById('user-email').textContent = userData.email || 'No email on file.';
      } else {
        console.log("No user document found in Firestore.");
        document.getElementById('user-name').textContent = 'Valued Customer';
        document.getElementById('user-email').textContent = user.email || 'No email on file.';
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showFormError("Could not load your account details. Please try again later.");
    }
  } else {
    // This should not be reachable.
    console.log("No user authenticated, redirecting to login.");
    // FIX 8.1: Changed redirect path to use trailing slash
    window.location.href = '/login/'; 
  }
}

/**
 * Attaches the listener for the sign-out button.
 */
function attachSignOutListener() {
  if (!signOutButton) return;
  signOutButton.addEventListener('click', handleSignOut);
}

/**
 * Handles the sign-out logic.
 */
const handleSignOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out.");
    // Redirect to homepage
    // FIX 8.1: Changed redirect path to use root slash
    window.location.href = '/';
  } catch (error) {
    console.error("Sign Out Error:", error);
  }
};


// --- Page-Specific Initialization ---
// Determine which page we're on and run the appropriate functions.
// This is safer than the previous implementation which had conflicting logic.
if (loginForm) {
  attachLoginFormListener();
}

if (registerForm) {
  attachRegisterFormListener();
}

if (accountDetails) {
  // On the account page, we need to wait for the auth state
  // to be confirmed by the global listener before loading details.
  // We can just call our function, and the `auth.currentUser`
  // check inside it will be accurate.
  loadAccountDetails();
  attachSignOutListener();
}

