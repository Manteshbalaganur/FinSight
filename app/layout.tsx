import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PortfolioAI — Stock Prediction & Portfolio Intelligence",
  description:
    "AI-Powered Stock Price Prediction & Portfolio Intelligence Dashboard — academic prototype demo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-base text-text-primary">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col md:ml-60">
            <TopBar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
