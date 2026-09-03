/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  moduleNameMapper: {
    "^@clip/db$": "<rootDir>/../../packages/db/src/index.ts",
    "^@clip/types$": "<rootDir>/../../packages/types/src/index.ts",
    "^@clip/config$": "<rootDir>/../../packages/config/src/index.ts",
  },
};
