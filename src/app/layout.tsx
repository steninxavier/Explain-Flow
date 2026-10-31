import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExplainFlow | Renderer prototype",
  description: "From idea to clear video."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
