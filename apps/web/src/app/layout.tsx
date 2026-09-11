import type { Metadata } from "next";
import Providers from "@/components/aegis/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS | Academic Research Group",
  description: "Collaborative academic review and research workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
