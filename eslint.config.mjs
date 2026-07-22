import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Data fetching in useEffect + setState is the intentional pattern used
      // throughout this app's hooks (services/*.ts + hooks/use-*.ts), guarded
      // against race conditions with an `ativo`/cancelled flag. This rule
      // pushes towards Suspense-based data fetching, which is out of scope
      // for this project's architecture (no React Query / RSC data layer).
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
