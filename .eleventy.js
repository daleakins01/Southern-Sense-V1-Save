// .eleventy.js
// This is the configuration file for Eleventy.
// It tells Eleventy how to build the site.

module.exports = function(eleventyConfig) {

    // --- Passthrough Copy ---
    // This tells Eleventy to copy files directly from 'src' to '_site'
    // without trying to process them as templates. This is essential
    // for CSS, JavaScript, images, and other assets.

    // 1. CSS: Copy 'src/output.css' to '_site/css/style.css'
    eleventyConfig.addPassthroughCopy({ "src/output.css": "css/style.css" });

    // 2. Critical JavaScript Modules: CRITICAL FIX
    // These must be copied directly to the site root (e.g., /firebase-loader.js)
    // to match the ES module import paths used in your HTML files.
    eleventyConfig.addPassthroughCopy({ "src/firebase-loader.js": "firebase-loader.js" });
    eleventyConfig.addPassthroughCopy({ "src/main.js": "main.js" });
    eleventyConfig.addPassthroughCopy({ "src/cart.js": "cart.js" });
    eleventyConfig.addPassthroughCopy({ "src/auth.js": "auth.js" });

    // 3. WebP Images: FIX 4.1 & Image Routing
    // Copy images from 'src/' directly to '_site/' (the site root) so links 
    // like <img src="/aloha-luxe-candle.webp"> resolve correctly.
    eleventyConfig.addPassthroughCopy({ "src/*.webp": "/" });
    
    // 4. Generic JS Passthrough (for files in subfolders, like src/js/index.js)
    // This rule remains to catch all other JS files that may live in subdirectories.
    eleventyConfig.addPassthroughCopy("src/**/*.js");
    
    // --- Filters ---
    // This adds the 'safe' filter, which is CRITICAL for rendering
    // HTML content (like product descriptions) from Firestore. (FIX 1.2)
    eleventyConfig.addFilter("safe", (content) => {
        if (content) {
            return content;
        }
        return "";
    });

    
    // --- Watch Targets ---
    // This tells Eleventy to automatically rebuild the site if these files change.
    
    // 1. Watch the compiled CSS file for changes.
    eleventyConfig.addWatchTarget("src/output.css");
    
    // 2. Watch JavaScript files for changes.
    eleventyConfig.addWatchTarget("src/**/*.js");
    
    // 3. Watch image files for changes.
    eleventyConfig.addWatchTarget("src/*.webp");


    // --- Layout Aliasing ---
    // This allows you to specify 'layout: "layout.html"' in your front matter
    // instead of the full path. It's a quality-of-life improvement.
    eleventyConfig.addLayoutAlias("layout", "layout.html");

    // --- Base Configuration ---
    // These are the main settings for the project.
    return {
        // 'dir' configures the directory structure.
        dir: {
            input: "src",         // Source files are in the 'src' folder.
            output: "_site",      // The built site will be in the '_site' folder.
            includes: "_includes",// Partials (header, footer) are in 'src/_includes'.
            data: "_data"         // Global data files are in 'src/_data'.
        },
        // 'templateFormats' specifies which file types Eleventy should process.
        templateFormats: [
            "html",   // Process .html files (using Liquid by default).
            "liquid", // Process .liquid files.
            "md"      // Process .md (Markdown) files.
        ],
        // 'htmlTemplateEngine' sets Liquid as the default engine for .html files.
        htmlTemplateEngine: "liquid",
        // 'markdownTemplateEngine' sets Liquid as the engine for .md files.
        markdownTemplateEngine: "liquid",
        // 'passthroughFileCopy' enables the passthrough copy feature.
        passthroughFileCopy: true
    };
};