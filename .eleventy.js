module.exports = function(eleventyConfig) {

    // 1. Pass-Through Copies: Copies these directories/files directly to the output folder (_site)
    // CRITICAL: This ensures all image and JS assets placed in the /src directory are available 
    // in the output /src directory, allowing the /src/... absolute paths to work.
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
    
    // Pass through all specific product images
    eleventyConfig.addPassthroughCopy("src/*.webp");

    // Pass through all JS files in the root /src/ directory
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