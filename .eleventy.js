module.exports = function (eleventyConfig) {
  // --- Eleventy Configuration ---
  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    strictFilters: false, // For easier debugging
  });

  // --- Passthrough Copy ---
  // Copies files directly to the output directory (_site) without processing.

  // 1. Passthrough the main compiled CSS file from the root
  eleventyConfig.addPassthroughCopy("output.css");

  // 2. Passthrough all assets *inside* src.
  // These paths must be relative to the `src` input directory.
  // (FIX 8:09 PM): Removed the conflicting "src/output.css" passthrough.
  eleventyConfig.addPassthroughCopy("logo.webp"); // Logo
  eleventyConfig.addPassthroughCopy("js"); // Main JS folder
  eleventyConfig.addPassthroughCopy("auth.js");
  eleventyConfig.addPassthroughCopy("cart.js");
  eleventyConfig.addPassthroughCopy("firebase-loader.js");
  eleventyConfig.addPassthroughCopy("main.js");

  // Copy all images from /src
  eleventyConfig.addPassthroughCopy("*.webp");

  // --- Watch Targets ---
  // Reload the browser when these files change.
  eleventyConfig.addWatchTarget("output.css");
  eleventyConfig.addWatchTarget("src/js/index.js");

  // --- Directory Configuration ---
  return {
    dir: {
      input: "src", // Source files
      includes: "_includes", // Layouts and partials
      data: "_data", // Global data
      output: "_site", // Build output
    },
    // Use Nunjucks as the templating engine for HTML
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

