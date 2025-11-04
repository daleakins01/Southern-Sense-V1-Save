/*
 * main.js
 * General client-side UI and utility functions, including Scent Quiz logic.
 */

// FIX: Ensure serverTimestamp is imported for any logging or future features, though not explicitly used in current logic.
import { 
    db, 
    collection, 
    getDocs,
    serverTimestamp // CRITICAL FIX: Ensure all Firebase functions are imported from the loader
} from '/src/firebase-loader.js'; 

// --- 1. Global UI / Navigation ---

document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Toggle ARIA attributes for accessibility
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Sticky Header Logic (Simple implementation)
    const header = document.querySelector('header');
    if (header) {
        // Debounce or Throttle this for better performance in a full application
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                // Add classes for sticky effect
                header.classList.add('shadow-md', 'bg-parchment/95');
                header.classList.remove('bg-parchment');
            } else {
                // Remove classes when scrolling back to the top
                header.classList.remove('shadow-md', 'bg-parchment/95');
                header.classList.add('bg-parchment');
            }
        });
    }

    // Add event listeners for the Scent Quiz if the elements are present
    initializeScentQuiz();
});


// --- 2. Scent Quiz Logic ---

let scentQuizData = {
    step: 1,
    answers: {}
};
let products = []; // Cache all products

const quizContainer = document.getElementById('scent-quiz-container');
const quizForm = document.getElementById('scent-quiz-form');
const quizResults = document.getElementById('scent-quiz-results');

/**
 * Loads products from Firestore and initializes the quiz flow.
 */
async function initializeScentQuiz() {
    if (!quizContainer) return; // Only run on the Scent Quiz page

    try {
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(productsRef);
        
        querySnapshot.forEach(doc => {
            products.push(doc.data());
        });
        
        console.log(`Scent Quiz initialized. Loaded ${products.length} products.`);
        renderQuizStep(); // Start the quiz after data is loaded
        
    } catch (error) {
        console.error("Error loading products for Scent Quiz:", error);
        quizContainer.innerHTML = '<p class="text-red-600">Failed to load scent options. Please try again later.</p>';
    }
}

/**
 * The Scent Quiz questions and options.
 */
const questions = [
    {
        step: 1,
        title: "Where do you burn candles most often?",
        name: "location",
        options: [
            { text: "Living Room / Open Area", value: "strong" },
            { text: "Bedroom / Reading Nook", value: "medium" },
            { text: "Bathroom / Small Space", value: "light" }
        ]
    },
    {
        step: 2,
        title: "What is your desired scent outcome?",
        name: "vibe",
        options: [
            { text: "Relaxing and cozy (Earthy, Woody)", value: "woody-earthy" },
            { text: "Fresh and clean (Aquatic, Citrus)", value: "fresh-citrus" },
            { text: "Sweet and welcoming (Fruity, Vanilla)", value: "fruity-sweet" },
            { text: "Elegant and romantic (Floral, Spice)", value: "floral-spice" }
        ]
    },
    {
        step: 3,
        title: "What mood best describes your home decor?",
        name: "aesthetic",
        options: [
            { text: "Modern / Minimalist", value: "fresh-citrus" }, // Freshness often suits modern
            { text: "Traditional / Cozy", value: "woody-earthy" }, // Woodsy/Earthy for cozy
            { text: "Bohemian / Eclectic", value: "floral-spice" }, // Complex scents for Eclectic
        ]
    }
];

/**
 * Renders the current step of the quiz.
 */
function renderQuizStep() {
    const currentQuestion = questions.find(q => q.step === scentQuizData.step);

    if (!currentQuestion) {
        // Quiz finished
        showResults();
        return;
    }

    let optionsHtml = '';
    currentQuestion.options.forEach(option => {
        optionsHtml += `
            <label class="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer border border-stone/20">
                <input type="radio" name="${currentQuestion.name}" value="${option.value}" class="mr-3 accent-burnt-orange" required>
                <span class="font-medium text-charcoal">${option.text}</span>
            </label>
        `;
    });

    quizForm.innerHTML = `
        <h3 class="text-2xl font-playfair text-charcoal mb-6">Question ${currentQuestion.step} of ${questions.length}: ${currentQuestion.title}</h3>
        <div class="space-y-4">
            ${optionsHtml}
        </div>
        <div class="mt-8 flex justify-between">
            ${scentQuizData.step > 1 ? '<button type="button" id="back-button" class="px-6 py-3 border border-stone/30 text-charcoal rounded-lg hover:bg-parchment/70 transition">Back</button>' : '<div></div>'}
            <button type="submit" class="px-8 py-3 bg-burnt-orange text-parchment font-bold rounded-lg shadow-md hover:bg-burnt-orange/80 transition duration-300">
                Next
            </button>
        </div>
    `;

    // Attach listener for the 'Back' button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            scentQuizData.step--;
            renderQuizStep();
        });
    }

    // Reattach form submission listener
    quizForm.removeEventListener('submit', handleQuizSubmission);
    quizForm.addEventListener('submit', handleQuizSubmission);
}

/**
 * Handles the user's answer submission.
 */
function handleQuizSubmission(e) {
    e.preventDefault();
    const formData = new FormData(quizForm);
    const questionName = questions.find(q => q.step === scentQuizData.step).name;
    const selectedValue = formData.get(questionName);

    if (selectedValue) {
        scentQuizData.answers[questionName] = selectedValue;
        scentQuizData.step++;
        renderQuizStep();
    }
}

/**
 * Calculates and displays the final quiz results.
 */
function showResults() {
    quizContainer.classList.add('hidden');
    quizResults.classList.remove('hidden');

    const scentVibe = scentQuizData.answers.vibe;
    const scentStrength = scentQuizData.answers.location; // Use location as a proxy for desired strength

    // 1. Determine best scent family match (based on Question 2, 'vibe')
    const recommendedScentFamily = scentVibe;

    // 2. Filter products based on the best match
    let matchedProducts = products.filter(p => p.scentFamily === recommendedScentFamily);

    // 3. Optional: Refine by desired strength (simple filter based on numeric 'strength' field in product data)
    // Map the text value (location) to a numeric range for filtering (assuming strength is 1-5)
    let minStrength = 1;
    let maxStrength = 5;

    if (scentStrength === 'strong') {
        minStrength = 4;
    } else if (scentStrength === 'medium') {
        minStrength = 3;
        maxStrength = 4;
    } else if (scentStrength === 'light') {
        maxStrength = 2;
    }

    // Filter by strength range
    let finalProducts = matchedProducts.filter(p => p.strength >= minStrength && p.strength <= maxStrength);
    
    // Fallback: If no products match the strength filter, show all products from the recommended family
    if (finalProducts.length === 0) {
        finalProducts = matchedProducts;
    }
    
    // Final Fallback: If still empty, show featured products
    if (finalProducts.length === 0) {
        finalProducts = products.filter(p => p.featured).slice(0, 4);
    }
    
    // If the list is still empty, show a generic message
    if (finalProducts.length === 0) {
        quizResults.innerHTML = `
            <h2 class="text-4xl font-playfair text-charcoal mb-4">Finding Your Perfect Match...</h2>
            <p class="text-lg text-stone mb-8">Based on your answers, we couldn't find an exact match, but try browsing our <a href="/shop/" class="text-burnt-orange font-semibold hover:underline">Full Collection</a>!</p>
        `;
        return;
    }


    // --- Render Results ---
    let productsHtml = '';
    finalProducts.slice(0, 4).forEach(product => { // Show top 4 matches
        const price = parseFloat(product.price).toFixed(2);
        // FIX: Ensure image URL uses the correct /src/ prefix
        const imageUrl = product.imageUrl.startsWith('http') ? product.imageUrl : '/src/' + product.imageUrl;
        
        productsHtml += `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden">
                <a href="/product/?id=${product.id}">
                    <img src="${imageUrl}" alt="${product.name}" class="w-full h-64 object-cover">
                </a>
                <div class="p-4">
                    <h4 class="text-xl font-playfair text-charcoal mb-1">${product.name}</h4>
                    <p class="text-sm text-stone mb-3">${product.shortDescription}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-burnt-orange">$${price}</span>
                        <a href="/product/?id=${product.id}" class="px-3 py-1 bg-stone text-parchment rounded-lg text-sm hover:bg-charcoal transition">View Scent</a>
                    </div>
                </div>
            </div>
        `;
    });

    quizResults.innerHTML = `
        <h2 class="text-4xl font-playfair text-charcoal mb-4">Your Personalized Scent Recommendation</h2>
        <p class="text-lg text-stone mb-8">Based on your love for **${capitalize(recommendedScentFamily)}** scents and your desire for a **${scentStrength}** throw, here are your best matches:</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${productsHtml}
        </div>
        
        <div class="mt-10 text-center">
            <a href="/shop/" class="px-8 py-3 border border-burnt-orange text-burnt-orange font-bold rounded-lg hover:bg-burnt-orange/10 transition duration-300">
                Browse All Products
            </a>
        </div>
    `;
    
    // Scroll to the top of results
    quizResults.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Simple capitalization utility.
 */
function capitalize(str) {
    if (!str) return '';
    const parts = str.split('-');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}