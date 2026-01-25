import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KALA - Academic Intelligence OS",
  description: "Transform Academic Chaos into Cognitive Clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-primary text-primary transition-colors duration-500 overflow-hidden">{children}</body>
    </html>
  );
}
