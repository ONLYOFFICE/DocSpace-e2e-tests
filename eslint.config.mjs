import js from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        document: "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Add TypeScript-specific rules here
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty-pattern": ["error", { allowObjectPatternsAsParameters: true }],
    },
  },
];
