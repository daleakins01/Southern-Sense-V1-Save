// src/auth.js

// --- Firebase Imports ---
import { auth, db } from '/firebase-loader.js';
import { 
    createUserWithEmailAndPassword, 
    getAuth 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { 
    doc, 
    setDoc 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// --- DOM Elements ---
const registerForm = document.getElementById('register-form');
const registerStatus = document.getElementById('register-status');
const registerButton = document.getElementById('register-button');

/**
 * Initializes the registration form submission logic.
 */
function initializeRegister() {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';
        registerStatus.classList.add('hidden');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        try {
            // 1. Create the Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
            const user = userCredential.user;

            // 2. Create the corresponding user profile document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                name: name,
                role: 'customer',
                createdAt: new Date().toISOString()
            });

            registerStatus.textContent = 'Registration successful! Redirecting to your account...';
            registerStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-green-100 text-green-700';
            registerStatus.classList.remove('hidden');

            // 3. Redirect to the account page
            setTimeout(() => {
                // IMPORTANT: Rely on the global observer to route the user correctly, 
                // but direct to a known logged-in state page.
                window.location.href = '/account/'; 
            }, 1000);

        } catch (error) {
            registerStatus.textContent = `Registration Failed: ${error.message.replace('Firebase: ', '')}`;
            registerStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-red-100 text-red-700';
            registerStatus.classList.remove('hidden');
            registerButton.disabled = false;
            registerButton.textContent = 'Create Account';
        }
    });
}

// CRITICAL FIX: Only run the registration setup logic after Firebase is ready.
document.addEventListener('firebase-ready', initializeRegister);