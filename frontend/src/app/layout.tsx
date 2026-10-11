// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
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
  title: "SetterMind AI",
  description: "Suite de Prospección Consultiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#070D14] text-slate-100 min-h-screen flex antialiased">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-screen bg-[#070D14] text-slate-100 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}