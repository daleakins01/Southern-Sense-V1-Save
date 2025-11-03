module.exports = function(eleventyConfig) {
    // Tell 11ty to use the .eleventy.js in the repo root

    // --- CRITICAL FIX: Passthrough Copy for Static Assets ---
    // Copy the entire 'src' directory content (JS, CSS, Images, etc.) 
    // to the output root, preserving the 'src' subdirectory name.
    // This resolves the 404 errors for /src/output.css, /src/main.js, and /src/*.webp.
    eleventyConfig.addPassthroughCopy({ 'src': 'src' });
    
    // --- Existing Configuration ---
    
    return {
        // Set the input directory to the 'src' folder
        dir: {
            input: "src",
            output: "_site" // Eleventy's default output folder
        },
        
        // Use Nunjucks for templates by default
        templateFormats: ["html", "njk", "md"],
        
        // Global data file is src/_data/site.json
        dataTemplateEngine: "njk",
        
        // HTML templates use Nunjucks by default
        htmlTemplateEngine: "njk",
        
        // Markdown files use Liquid by default
        markdownTemplateEngine: "liquid"
    };
};