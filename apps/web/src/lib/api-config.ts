import { setApiBaseUrl } from "@aegis/api-client";

// API_URL is reachable from the Next.js server (Aspire endpoint / compose
// service name); NEXT_PUBLIC_API_URL is the browser address and the only one
// inlined into client bundles.
setApiBaseUrl(process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5180");
