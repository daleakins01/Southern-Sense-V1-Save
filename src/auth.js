// auth.js
// Southern Sense — Unified Authentication Logic (Firebase 9.22.2)

// --- Imports (match firebase-loader.js version) ---
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- Use the same initialized app from firebase-loader.js ---
const auth = window.firebaseAuth || getAuth();
const db = window.firebaseDB || getFirestore();

// --- UI Elements ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const accountDetails = document.getElementById('account-details');
const signOutButton = document.getElementById('sign-out-button');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// --- Utility ---
function showFormError(message) {
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
  }
}

function setFormLoading(isLoading) {
  const form = loginForm || registerForm;
  if (!form) return;
  const btnText = form.querySelector('#button-text');
  const btnSpinner = form.querySelector('#button-spinner');
  const btn = form.querySelector('button[type="submit"]');
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

// --- Register ---
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
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await setDoc(doc(db, "users", user.uid), {
        name: `${firstName} ${lastName}`,
        email: email,
        createdAt: new Date().toISOString()
      });
      console.log("User registered:", email);
      window.location.href = '/account/';
    } catch (err) {
      console.error("Registration Error:", err);
      showFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  });
}

// --- Login ---
function attachLoginFormListener() {
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", email);
      window.location.href = '/account/';
    } catch (err) {
      console.error("Login Error:", err);
      showFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  });
}

// --- Load Account ---
async function loadAccountDetails() {
  if (!accountDetails) return;
  const user = auth.currentUser;
  if (!user) {
    console.log("No user, redirecting to login.");
    window.location.href = '/login/';
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    if (userDoc.exists()) {
      const data = userDoc.data();
      nameEl.textContent = data.name || 'Valued Customer';
      emailEl.textContent = data.email || user.email;
    } else {
      nameEl.textContent = 'Valued Customer';
      emailEl.textContent = user.email;
    }
  } catch (err) {
    console.error("Error loading account:", err);
    showFormError("Could not load your account details.");
  }
}

// --- Sign Out ---
function attachSignOutListener() {
  if (!signOutButton) return;
  signOutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
      window.location.href = '/';
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  });
}

// --- Init per page ---
if (loginForm) attachLoginFormListener();
if (registerForm) attachRegisterFormListener();
if (accountDetails) {
  // Wait briefly to ensure auth loaded
  setTimeout(loadAccountDetails, 1000);
  attachSignOutListener();
}
