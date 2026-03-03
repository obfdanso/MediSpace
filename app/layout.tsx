import type { Metadata } from "next";
import { Geist, Geist_Mono, PT_Serif, Lobster_Two } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-serif',
});

const lobsterTwo = Lobster_Two({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lobster-two',
});

export const metadata: Metadata = {
  title: "MediCare AI - Your Personal Medical Assistant",
  description: "Get instant answers about allergies, drug interactions, and personalized health guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ptSerif.variable} ${lobsterTwo.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
