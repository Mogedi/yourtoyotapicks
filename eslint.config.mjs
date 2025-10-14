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
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "no-console": ["warn", {
                allow: ["warn", "error"],
            }],
            "prefer-const": "error",
            "no-var": "error",
        },
    }
];
