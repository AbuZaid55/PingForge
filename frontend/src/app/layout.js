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

export const metadata = {
  title: "PingForge | Automated Cron Job Scheduler",
  description: "PingForge lets you schedule, start, stop, and monitor automated HTTP requests effortlessly. Forge reliable uptime with flexible job scheduling and monitoring.",
  keywords: ["PingForge", "cron job scheduler", "http request scheduler", "uptime monitor", "background jobs", "api pinger", "server health monitor"],
  icons: {
    icon: "/favicon.svg",
  },
  authors: [{ name: "PingForge" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
