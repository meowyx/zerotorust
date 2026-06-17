import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display / headings / UI
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

// Body copy
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

// Labels, episode numbers, chapter refs, chips, code
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jet",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zerotorust.com"),
  title: "Rust Series | meowy",
  description:
    "A growing set of Rust video series by meowy. Series 1, Rust from Zero, is a twelve-episode path from your first cargo new to async Rust. Every episode pairs the video with a companion guide, the exact book chapter, and the Rustlings drills that build the same muscles.",
  keywords: [
    "Rust",
    "Rust tutorial",
    "learn Rust",
    "Rustlings",
    "meowy",
    "Rust series",
    "Rust from Zero",
  ],
  authors: [{ name: "meowy", url: "https://meowy.xyz" }],
  creator: "meowy",
  openGraph: {
    title: "Rust Series",
    description:
      "A growing set of Rust video series by meowy, each paired with companion guides, book chapters and Rustlings drills.",
    url: "https://zerotorust.com",
    siteName: "Rust Series",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rust Series",
    description: "A growing set of Rust video series by meowy.",
    creator: "@me256ow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
