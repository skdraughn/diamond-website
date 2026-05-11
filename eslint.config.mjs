import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "app/[league]/**",
    "app/**/lobby/page.js",
    "app/**/refer/page.js",
    "app/**/view/page.js",
    "app/privacy/page.tsx",
    "app/strikeout/PlayStrikeout.tsx",
    "app/hooks/useHigherLowerGame.js",
    "src/aws-exports.js",
    "utils/teamLogoMap.js",
  ]),
]);

export default eslintConfig;
