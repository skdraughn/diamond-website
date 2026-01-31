import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/components/ConfigureAmplify";
import { openGraphImage } from "@/utils/sharedMetadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diamond Trivia | Daily MLB Trivia Games",
  description:
    "Play daily MLB trivia games like Guess the Player, Strikeout, Connections, and Griddle. Test your baseball knowledge and build your streak. Available on the App Store!",
  openGraph: {
    ...openGraphImage,
    title: "Diamond Trivia | Daily MLB Trivia Games",
    description:
      "Test your MLB knowledge with daily trivia games like Strikeout and Griddle. Available on the App Store!",
    url: "https://www.diamondtrivia.app",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diamond Trivia",
    description:
      "Play daily MLB trivia. Challenge your baseball brain with Strikeout and Griddle.",
  },
  viewport: "width=device-width, initial-scale=1",
  metadataBase: new URL("https://www.diamondtrivia.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
