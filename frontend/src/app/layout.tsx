import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailyHealth Monitor - AI-Powered Wellness Dashboard",
  description: "Track your sleep, stress, hydration, and steps with smart sensor sync and AI personalization.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512.jpg",
    apple: "/icon-512.jpg",
  }
};

import PwaRegister from "@/components/PwaRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  var mono = localStorage.getItem('theme_luxury_mono');
                  if (mono === 'true') {
                    document.documentElement.classList.add('luxury-monochromatic');
                  } else {
                    document.documentElement.classList.remove('luxury-monochromatic');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `
          }}
        />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060a13]">
        <div id="google_translate_element" style={{ display: 'none' }} />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
