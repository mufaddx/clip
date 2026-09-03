/**
 * Shared ESLint base — see docs/development/CODING_STANDARDS.md. Every
 * app/package extends this rather than redefining rules locally. Kept as
 * plain CommonJS since ESLint's config resolution doesn't go through the
 * TS build.
 */
module.exports = {
  root: false,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off", // workers/services log deliberately — see docs/architecture/BACKGROUND_JOBS.md
  },
  ignorePatterns: ["dist", ".next", "node_modules"],
};
