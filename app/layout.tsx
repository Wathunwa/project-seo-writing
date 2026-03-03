import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI SEO Article Writer",
  description: "Write and optimize articles with AI and SEO analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
