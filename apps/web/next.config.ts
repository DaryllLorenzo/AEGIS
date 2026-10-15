import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by Aspire's Next.js publish target and by the production Dockerfile:
  // the build emits a self-contained server under .next/standalone.
  output: "standalone",
  // The @aegis/* workspace packages ship TypeScript source, so Next compiles them.
  transpilePackages: ["@aegis/api-client", "@aegis/domain"],
};

export default nextConfig;
