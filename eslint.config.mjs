import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Base: Next TypeScript rules
  ...compat.extends("next/typescript"),

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "public/**",
      "data/**",
      "src/lib/units/generated/**",
      "next-env.d.ts",
    ],
  },

  // TypeScript in src only
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Rely on TS for unuseds; keep warnings lighter
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Relax noisy TS rules during migration
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // React-specific rules we don’t need with React 19
      "react/display-name": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },

  // Node scripts
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
