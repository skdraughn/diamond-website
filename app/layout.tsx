import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/components/ConfigureAmplify";
import { openGraphImage } from "@/utils/sharedMetadata";
import ThemeRegistry from "./theme/ThemeRegistry";
import Header from "./components/Header";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
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
  metadataBase: new URL("https://www.diamondtrivia.app"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${outfit.variable} ${outfit.className}`}>
      <body
        className={`${geistMono.variable} antialiased`}
      >
        <ConfigureAmplify />
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <Header />
            {children}
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
