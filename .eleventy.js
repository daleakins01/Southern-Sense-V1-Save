// .eleventy.js
// This is the configuration file for Eleventy.
// It tells Eleventy how to build the site.

module.exports = function(eleventyConfig) {

    // --- Passthrough Copy: CRITICAL FIX FOR ASSET ROUTING AND MIME TYPE ---
    // This uses explicit mapping to ensure files are copied to the exact path
    // expected by your templates, which resolves the 404s and the MIME type error.

    // 1. CSS: Copy 'src/output.css' directly to the site root: /output.css
    // This is where your HTML looks for the file. The old rules were confused.
    eleventyConfig.addPassthroughCopy({ "src/output.css": "output.css" });
    
    // 2. JavaScript Modules: Copy modules directly to the site root (e.g., /firebase-loader.js).
    eleventyConfig.addPassthroughCopy({ "src/firebase-loader.js": "firebase-loader.js" });
    eleventyConfig.addPassthroughCopy({ "src/main.js": "main.js" });
    eleventyConfig.addPassthroughCopy({ "src/cart.js": "cart.js" });
    eleventyConfig.addPassthroughCopy({ "src/auth.js": "auth.js" });

    // 3. Images: Copy ALL .webp images from 'src/' to the site root.
    // This fixes all image 404s (e.g., /logo.webp, /candles-header.webp).
    eleventyConfig.addPassthroughCopy({ "src/*.webp": "/" });
    
    // 4. Generic Passthrough (Catch-all for subfolders like src/js)
    eleventyConfig.addPassthroughCopy("src/js");


    // --- Filters ---
    eleventyConfig.addFilter("safe", (content) => {
        if (content) {
            return content;
        }
        return "";
    });

    
    // --- Watch Targets ---
    eleventyConfig.addWatchTarget("src/output.css");
    eleventyConfig.addWatchTarget("src/**/*.js");
    eleventyConfig.addWatchTarget("src/*.webp");


    // --- Layout Aliasing ---
    eleventyConfig.addLayoutAlias("layout", "layout.html");

    // --- Base Configuration ---
    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: [
            "html",
            "liquid",
            "md"
        ],
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
        passthroughFileCopy: true
    };
};