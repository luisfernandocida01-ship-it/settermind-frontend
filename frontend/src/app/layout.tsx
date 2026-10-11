import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SetterMind AI - Suite de Prospección Consultiva",
  description: "Sistema de prospección y cualificación para setters y closers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${inter.className}`}>
      <body className="bg-[#0B121E] text-slate-100 min-h-screen flex antialiased selection:bg-sky-500 selection:text-white font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-screen bg-[#0F172A] text-slate-100 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </body>
    </html>
  );
}