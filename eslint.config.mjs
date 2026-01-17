import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginN from "eslint-plugin-n";

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
      "import": eslintPluginImport,
      "n": eslintPluginN,
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

      // Import rules
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@root/src/common/*", "@root/src/common"],
              "message": "Use @common/* instead of @root/src/common/*"
            },
            {
              "group": ["@root/src/modules/*", "@root/src/modules"],
              "message": "Use @modules/* instead of @root/src/modules/*"
            },
            {
              "group": ["@root/src/cli/*", "@root/src/cli"],
              "message": "Use @cli/* instead of @root/src/cli/*"
            }
          ]
        }
      ],

      "n/prefer-node-protocol": "error",

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
