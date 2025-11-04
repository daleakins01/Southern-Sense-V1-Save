module.exports = function(eleventyConfig) {

    // 1. Pass-Through Copies: Copies these directories/files directly to the output folder (_site)
    // CRITICAL FIX: The previous config only copied JS files in a nested /js folder, 
    // but main.js, cart.js, etc., are in the root /src/ folder.
    eleventyConfig.addPassthroughCopy("src/logo.webp");
    eleventyConfig.addPassthroughCopy("src/candles-header.webp");
    eleventyConfig.addPassthroughCopy("src/melts-header.webp");
    eleventyConfig.addPassthroughCopy("src/background-parchment.webp");
    eleventyConfig.addPassthroughCopy("src/clean-oils.webp");
    eleventyConfig.addPassthroughCopy("src/finest-wax.webp");
    eleventyConfig.addPassthroughCopy("src/paula-bryan-portrait.webp");
    eleventyConfig.addPassthroughCopy("src/facebook-icon.webp");
    eleventyConfig.addPassthroughCopy("src/tiktok-icon.webp");
    eleventyConfig.addPassthroughCopy("src/output.css"); // Tailwind CSS output
    
    // CRITICAL FIX: Explicitly add main.js and cart.js 
    eleventyConfig.addPassthroughCopy("src/main.js");
    eleventyConfig.addPassthroughCopy("src/cart.js");
    eleventyConfig.addPassthroughCopy("src/auth.js");
    eleventyConfig.addPassthroughCopy("src/firebase-loader.js");

    // Pass through all specific product images
    eleventyConfig.addPassthroughCopy("src/*.webp");

    // Pass through all JS files in the root /src/ directory
    // NOTE: Keeping the general pass-through below for safety/future files, but adding explicit copies above
    // to ensure critical files are definitely transferred.
    eleventyConfig.addPassthroughCopy("src/*.js"); 
    
    // Pass through the nested js folder for index.js
    eleventyConfig.addPassthroughCopy("src/js");


    // 2. Custom Configuration
    return {
        // Look for template files inside the `src` folder
        dir: {
            input: "src",
            // The output directory is typically `_site`
            output: "_site" 
        },
        // Enable Eleventy to process templates in these formats
        templateFormats: ["html", "md", "liquid"],
        // Use '.html' as the liquid/Nunjucks template engine for .html files
        htmlTemplateEngine: "html",
        markdownTemplateEngine: "liquid"
    };
};