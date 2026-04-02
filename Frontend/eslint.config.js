import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      "plugin:@cspell/recommended",
      "prettier",
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@cspell/spellchecker": [
        "error",
        {
          autoFix: true,
          checkComments: false,
          configFile: "cspell.json",
          cspell: {
            dictionaries: ["project-words"],
            dictionaryDefinitions: [
              {
                name: "project-words",
                path: "./project-words.txt",
              },
            ],
            ignoreRegExpList: ["/[\\u0621-\\u064A]+/"],
            language: "en,en-GB",
          },
        },
      ],
    },
  }
);
