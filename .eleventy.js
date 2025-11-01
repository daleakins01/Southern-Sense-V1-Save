module.exports = function (eleventyConfig) {
  // --- Eleventy Configuration ---
  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    strictFilters: false,
    dataDeepMerge: true,
  });

  // --- Passthrough Copy ---
  // Copies files directly from /src to /_site without processing.

  // (FIX 10:18 PM): Updated to copy the CSS file from its correct location
  // inside /src, matching the 'build:css' script in package.json.
  eleventyConfig.addPassthroughCopy("src/output.css");

  // Passthrough all JS modules
  eleventyConfig.addPassthroughCopy("src/auth.js");
  eleventyConfig.addPassthroughCopy("src/cart.js");
  eleventyConfig.addPassthroughCopy("src/firebase-loader.js");
  eleventyConfig.addPassthroughCopy("src/main.js");
  eleventyConfig.addPassthroughCopy("src/js/index.js");

  // Passthrough all images
  eleventyConfig.addPassthroughCopy("src/*.webp");

  // Passthrough the standalone Admin Panel files
  // (These are in the root, not /src)
  eleventyConfig.addPassthroughCopy("admin.html");
  eleventyConfig.addPassthroughCopy("admin-login.html");
  eleventyConfig.addPassthroughCopy("AdminPageFunctionsGuide.html");

  // --- Watch Targets ---
  // Tell Eleventy to trigger a rebuild when these files change.
  eleventyConfig.addWatchTarget("src/output.css");
  eleventyConfig.addWatchTarget("src/main.js");

  // --- Base Configuration ---
  return {
    // Set the source and output directories
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // Set default template engines
    templateFormats: ["html", "md", "njk", "liquid"],
    markdownTemplateEngine: "liquid",
    // (FIX 12:02 PM): Removed 'htmlTemplateEngine: "njk"'. This was
    // forcing the Nunjucks engine to parse plain HTML files,
    // which was crashing the build silently.
    dataTemplateEngine: "njk",
  };
};

