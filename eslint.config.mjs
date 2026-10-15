import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    globalIgnores([
        "**/.next/**",
        "**/out/**",
        "**/build/**",
        "**/node_modules/**",
        "apps/web/next-env.d.ts",
        "**/*.tsbuildinfo",
    ]),
    {
        settings: {
            next: {
                rootDir: "apps/web/",
            },
        },
    },
]);
