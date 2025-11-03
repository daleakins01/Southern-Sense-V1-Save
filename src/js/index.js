// === Homepage Specific Logic ===
// This script is loaded only by the homepage (index.html)

// Import Firestore services
// FIX: Corrected import path to reference the file in the new /src/ directory
import { 
    db, 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    limit // This function is used for fetching the featured product query.
} from '/src/firebase-loader.js'; 

/**
 * Loads all dynamic content for the homepage from Firestore.
 */
async function loadHomepageContent() {
    console.log("Homepage: Loading content from Firestore...");
    try {
        const docRef = doc(db, "siteContent", "homepage");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. Hero Section
            setText('hero-title', data.heroTitle);
            setText('hero-subtitle', data.heroSubtitle);
            
            // 2. Our Difference Section
            setText('diff-wax-text', data.diffWax);
            setText('diff-oils-text', data.diffOils);
            
            // 3. About Preview Section
            setText('about-title', data.aboutTitle);
            setText('about-text', data.aboutPreview);

            // 4. Featured Product (if set)
            if (data.featuredProductID) {
                await loadFeaturedProduct(data.featuredProductID);
            } else {
                const featuredContent = document.getElementById('featured-product-content');
                if (featuredContent) {
                    featuredContent.innerHTML = '<p class="text-stone">No featured product selected.</p>';
                }
            }

        } else {
            console.warn("Homepage: Document 'siteContent/homepage' does not exist.");
            const featuredContent = document.getElementById('featured-product-content');
            if (featuredContent) {
                featuredContent.innerHTML = '<p class="text-red-600">Error: Could not load homepage content configuration.</p>';
            }
        }
    } catch (error) {
        console.error("Error fetching homepage content:", error);
        const featuredContent = document.getElementById('featured-product-content');
        if (featuredContent) {
            featuredContent.innerHTML = `<p class="text-red-600">Error loading content: ${error.message}</p>`;
        }
    }
}

/**
 * Loads a specific product by its ID and renders it.
 * @param {string} id - The document ID of the product to feature.
 */
async function loadFeaturedProduct(id) {
    const featuredContent = document.getElementById('featured-product-content');
    if (!featuredContent) return; // Guard clause

    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.warn(`Featured Product: Product with ID "${id}" not found.`);
            featuredContent.innerHTML = `<p class="text-stone">The featured product could not be found. Please select a new one in the admin panel.</p>`;
            return;
        }

        const product = docSnap.data();
        
        // Check for image URL
        // FIX: Ensure image URL uses /src/ prefix to match Eleventy configuration
        const validImageUrl = product.imageUrl ? `/src/${product.imageUrl}` : 'https://placehold.co/600x400/FBF9F6/3D352E?text=Image+Not+Found';

        featuredContent.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8 items-center bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-xl">
                <img src="${validImageUrl}" alt="${product.name}" class="rounded-lg shadow-md w-full" onerror="this.src='https://placehold.co/600x400/FBF9F6/3D352E?text=Image+Error'; this.onerror=null;">
                <div class="text-left">
                    <h3 class="font-playfair text-4xl font-bold text-charcoal">${product.name}</h3>
                    <p class="mt-4 text-lg text-stone">${product.shortDescription}</p>
                    <p class="mt-4 text-stone"><strong class="font-bold text-charcoal">Notes:</strong> ${product.scentNotes}</p>
                    <a href="product.html?id=${id}" class="mt-6 inline-block bg-burnt-orange text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-700 transition-all">
                        Discover This Scent
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error loading featured product:", error);
        featuredContent.innerHTML = `<p class="text-red-600">Error loading content: ${error.message}</p>`;
    }
}

/**
 * Helper to safely set text content of an element.
 * @param {string} id - The ID of the element.
 * @param {string} text - The text to set.
 */
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text || ''; // Set to text or empty string
    } else {
        console.warn(`Homepage: Element with ID "${id}" not found.`);
    }
}

// --- INITIALIZATION ---
// Wait for the 'ui-ready' event from main.js (which runs on DOMContentLoaded)
// before we try to load Firestore data.
document.addEventListener('ui-ready', loadHomepageContent, { once: true });