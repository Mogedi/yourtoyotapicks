import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    // Global ignores
    {
        ignores: [
            "**/node_modules/",
            "**/.next/",
            "**/out/",
            "**/build/",
            "**/dist/",
            "**/coverage/",
            "**/playwright-report/",
            "**/test-results/",
        ]
    },
    // Extend Next.js configs
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    // Custom rules
    {
        rules: {
            // Strict rules (fail on these)
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error", // Strict: Must fix missing deps
            "prefer-const": "error",
            "no-var": "error",

            // Flexible rules (allow for development)
            "@typescript-eslint/no-explicit-any": "off", // Allow any for flexibility
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            "no-console": "off", // Allow console for development
        },
    }
];
