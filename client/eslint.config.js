import js from "@eslint/js";
import globals from "globals";
import vue from "eslint-plugin-vue";

export default [
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      vue,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...vue.configs["flat/essential"].rules,
    },
  },
]; 