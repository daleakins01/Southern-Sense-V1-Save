module.exports = function(eleventyConfig) {

    // 1. Pass-Through Copies: Copies ALL assets from the src directory to the _site/src directory,
    // preserving the directory structure. This explicitly solves the 404 errors for
    // /src/main.js, /src/cart.js, and /src/logo.webp by ensuring they exist in the output.
    eleventyConfig.addPassthroughCopy({ "src/": "src/" }); 
    
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
        // CRITICAL FIX 1: Reverting to 'liquid' to resolve the "Cannot find module 'Nunjucks'" error. 
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid"
    };
};