module.exports = function(eleventyConfig) {

    // 1. Pass-Through Copies: Copies ALL assets from the src directory to the _site/src directory,
    // preserving the directory structure. This explicitly solves the 404 errors for
    // /src/main.js, /src/cart.js, and /src/logo.webp by ensuring they exist in the output.
    // CRITICAL FIX: Use the 'copy everything' object pattern to robustly ensure file paths are maintained.
    eleventyConfig.addPassthroughCopy({ "src/": "src/" }); 
    
    // NOTE: The redundant individual copies (e.g., src/logo.webp, src/main.js, src/*.webp) 
    // and the unnecessary 'src/js' folder copy are now safely handled by the single rule above.

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