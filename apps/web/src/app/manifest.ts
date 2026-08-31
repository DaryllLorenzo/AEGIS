import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AEGIS Academic Research Group",
    short_name: "AEGIS",
    description: "Collaborative academic review and research workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#005134",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
