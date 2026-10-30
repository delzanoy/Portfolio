import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { LazyMotion, domMax } from "framer-motion";
import Script from "next/script";
import "./globals.css";
import MuseumBackground from "./components/MuseumBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const tasaOrbiter = localFont({
  src: "../public/font/TASAOrbiter-VariableFont_wght.ttf",
  variable: "--font-tasa",
});

export const metadata: Metadata = {
  title: "Delanoy | Product Designer",
  description: "Product Designer & Builder portfolio",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${tasaOrbiter.variable} antialiased`}
      >
        <LazyMotion features={domMax}>
          <MuseumBackground className="fixed inset-0 z-0" />
          <div className="relative z-10">
            {children}
          </div>
        </LazyMotion>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-2P4F6X9XB8`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2P4F6X9XB8');
          `}
        </Script>
      </body>
    </html>
  );
}
