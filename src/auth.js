/*
 * auth.js
 * Handles user authentication (register, login) functionality.
 */

// FIX: Corrected import path to reference the file in the new /src/ directory
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    setDoc, 
    doc, 
    db 
} from '/src/firebase-loader.js';
// FIX: Removed the non-existent 'logout' import.

/**
 * Handles user registration form submission.
 */
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerStatus = document.getElementById('register-status');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerStatus.textContent = 'Processing registration...';
            registerStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-yellow-100 text-yellow-700 block';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;

            try {
                // 1. Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Create a corresponding user document in Firestore's 'users' collection
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    // Additional fields can be added here (e.g., createdAt)
                });

                registerStatus.textContent = 'Registration successful! Redirecting to account...';
                registerStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-green-100 text-green-700 block';
                
                // CRITICAL FIX: Redirect to clean URL
                setTimeout(() => {
                    window.location.href = '/account/'; 
                }, 1000);

            } catch (error) {
                let message = error.message;
                if (message.includes('auth/email-already-in-use')) {
                    message = 'The email address is already in use by another account.';
                } else if (message.includes('auth/weak-password')) {
                    message = 'Password should be at least 6 characters.';
                } else {
                    message = `Registration failed: ${error.message.replace('Firebase: ', '')}`;
                }

                registerStatus.textContent = message;
                registerStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-red-100 text-red-700 block';
                console.error("Registration error:", error);
            }
        });
    }

    /**
     * Handles user login form submission.
     */
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginStatus.textContent = 'Attempting sign in...';
            loginStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-yellow-100 text-yellow-700 block';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await signInWithEmailAndPassword(auth, email, password);

                loginStatus.textContent = 'Sign in successful! Redirecting to account...';
                loginStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-green-100 text-green-700 block';

                // CRITICAL FIX: Redirect to clean URL
                setTimeout(() => {
                    window.location.href = '/account/'; 
                }, 1000);

            } catch (error) {
                let message = error.message;
                if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password' || message.includes('auth/user-not-found'))) {
                    message = 'Invalid email or password.';
                } else {
                    message = `Sign in failed: ${error.message.replace('Firebase: ', '')}`;
                }

                loginStatus.textContent = message;
                loginStatus.className = 'font-roboto text-sm p-3 rounded-lg bg-red-100 text-red-700 block';
                console.error("Login error:", error);
            }
        });
    }
});