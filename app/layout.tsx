import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepWise — E&TC AI Mock Interview Platform",
  description:
    "Practice real E&TC technical interviews with AI voice simulation. Get instant feedback on Digital Communication, Microcontrollers, Signals & Systems, and more.",
  keywords:
    "E&TC mock interview, electronics telecommunication, AI interview practice, VAPI, Gemini AI",
  openGraph: {
    title: "PrepWise — E&TC AI Mock Interview Platform",
    description: "AI-powered mock interviews for Electronics & Telecommunication final-year students",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased`} style={{ background: "#020408" }}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
