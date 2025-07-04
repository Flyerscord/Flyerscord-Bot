import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "dist-tests/**"], // Ignore the dist folder
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-member-accessibility": [
        "warn",
        {
          accessibility: "no-public",
        },
      ],

      // Prettier integration
      "prettier/prettier": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  // Applying Prettier config as a direct inclusion in the array
  eslintConfigPrettier,
];
