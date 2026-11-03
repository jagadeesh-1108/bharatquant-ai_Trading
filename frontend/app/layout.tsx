import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BharatQuant AI — Indian Stock Market Intelligence & Quantitative Platform",
  description: "AI-Powered Technical Intelligence, Quantitative Trading Strategy Lab, and Paper Trading for NSE & BSE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
