import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
// import drizzleEslintPlugin from "eslint-plugin-drizzle";

export default [
  {
    ignores: ["dist/**", "dist-tests/**", "coverage/**"], // Ignore the dist folder
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: './tsconfig.json',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "@typescript-eslint": typescriptEslintPlugin,
      // drizzle: drizzleEslintPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          reportUsedIgnorePattern: true,
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/explicit-member-accessibility": [
        "warn",
        {
          accessibility: "no-public",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",

      // Drizzle rules
      // ...drizzleEslintPlugin.configs.all.rules,

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
