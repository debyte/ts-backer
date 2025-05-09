import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["warn", 2],
      "@stylistic/quotes": ["warn", "double"],
      "@stylistic/max-len": ["warn", { "code": 80, "tabWidth": 2 }],
      "@typescript-eslint/no-unused-vars": ["error", {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }]
    },
  }
);
