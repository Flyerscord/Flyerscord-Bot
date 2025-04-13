import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import neverthrowMustUse from "eslint-plugin-neverthrow";

export default [
  {
    ignores: ["dist/**"], // Ignore the dist folder
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
      "neverthrow-must-use": neverthrowMustUse,
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

      // Neverthrow Rules
      "neverthrow-must-use/must-use-result": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  // Applying Prettier config as a direct inclusion in the array
  eslintConfigPrettier,
];
