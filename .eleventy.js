module.exports = function (eleventyConfig) {
  // === PASSTHROUGH (COPY) RULES ===

  // Copy root-level static assets to output
  eleventyConfig.addPassthroughCopy("output.css"); // Main compiled stylesheet

  // Copy JS modules from /src to output
  eleventyConfig.addPassthroughCopy("src/main.js");
  eleventyConfig.addPassthroughCopy("src/auth.js");
  eleventyConfig.addPassthroughCopy("src/cart.js");
  eleventyConfig.addPassthroughCopy("src/firebase-loader.js");

  // Copy images
  eleventyConfig.addPassthroughCopy("src/*.webp");

  // Copy legacy /src/js folder (if any contents are still used)
  eleventyConfig.addPassthroughCopy("src/js");

  // === NEW PASSTHROUGH RULES FOR ADMIN PANEL ===
  // These are standalone apps and should not be processed by Eleventy.
  // They will be copied directly from the root to the `_site` output folder.
  eleventyConfig.addPassthroughCopy("admin.html");
  eleventyConfig.addPassthroughCopy("admin-login.html");
  eleventyConfig.addPassthroughCopy("AdminPageFunctionsGuide.html");
  // === END NEW RULES ===

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    passthroughFileCopy: true,
    // Define template formats to process
    templateFormats: ["html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
