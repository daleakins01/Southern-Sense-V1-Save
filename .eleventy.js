// This file controls how Eleventy builds our site. It tells Eleventy
// where to find our source files, where to put the final built site,
// and which assets (like images, CSS, and JS) to copy over.

module.exports = function(eleventyConfig) {

  // === 1. Asset Pass-through ===
  // This tells Eleventy to copy these files/folders directly from `src`
  // to `_site` without trying to process them as templates.

  // Copy our final, built CSS file
  eleventyConfig.addPassthroughCopy("src/output.css");

  // Copy the `js` folder (which contains index.js)
  eleventyConfig.addPassthroughCopy("src/js");
  
  // Copy individual JS files from the root of `src`
  eleventyConfig.addPassthroughCopy("src/main.js");
  eleventyConfig.addPassthroughCopy("src/cart.js");
  eleventyConfig.addPassthroughCopy("src/auth.js");
  eleventyConfig.addPassthroughCopy("src/firebase-loader.js");
  
  // Copy HTML fragments (for header/footer loading)
  eleventyConfig.addPassthroughCopy("src/header.html");
  eleventyConfig.addPassthroughCopy("src/footer.html");
  
  // Copy all .webp images from the root of `src`
  eleventyConfig.addPassthroughCopy("src/*.webp");

  // Copy the favicon
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  // === 2. Directory Configuration ===
  // This tells Eleventy our new folder structure.
  return {
    dir: {
      // Where Eleventy looks for our source files.
      input: "src",
      // Where Eleventy builds the final, live site.
      output: "_site",
      // Where we store our reusable layout template.
      includes: "_includes",
      // Where we store global site data (e.g., site title).
      data: "_data"
    },
    
    // === 3. Template Engine Configuration ===
    // This tells Eleventy to treat all .html files as Nunjucks templates
    // so it can process variables like {{ title }} and use layouts.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

