// This is the configuration file for Eleventy.
// It tells Eleventy how to build the site.

module.exports = function(eleventyConfig) {

    // --- Passthrough Copy ---
    // This tells Eleventy to copy files directly from 'src' to '_site'
    // without trying to process them as templates. This is essential
    // for CSS, JavaScript, images, and other assets.

    // 1. CSS: Copy 'src/output.css' to '_site/css/style.css'
    // This was the fix we implemented earlier.
    eleventyConfig.addPassthroughCopy({ "src/output.css": "css/style.css" });

    // 2. JavaScript: Copy all '.js' files from 'src' to the root of '_site/src'
    // This will fix the 404 errors for 'main.js', 'firebase-loader.js', etc.
    eleventyConfig.addPassthroughCopy("src/**/*.js");

    // 3. WebP Images: Copy all '.webp' files from 'src' to the root of '_site/src'
    // This will fix all the 404 errors for 'logo.webp', 'candles-header.webp', etc.
    eleventyConfig.addPassthroughCopy("src/**/*.webp");

    
    // --- Watch Targets ---
    // This tells Eleventy to automatically rebuild the site if these files change.
    
    // 1. Watch the compiled CSS file for changes.
    eleventyConfig.addWatchTarget("src/output.css");
    
    // 2. Watch JavaScript files for changes.
    eleventyConfig.addWatchTarget("src/**/*.js");
    
    // 3. Watch image files for changes.
    eleventyConfig.addWatchTarget("src/**/*.webp");


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
        markdownTemplateEngine: "liquid"
    };
};

