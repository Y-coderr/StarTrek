import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // Import next/script
import "./globals.css";
import type React from "react"; // Import React

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
        title: "StarTrek",
        description: "AI-powered legal assistance platform",
};

export default function RootLayout({
        children,
}: {
        children: React.ReactNode;
}) {
        return (
                <html lang="en">
                        <head>
                                <Script
                                        src="https://cdn.lordicon.com/lordicon.js"
                                        strategy="lazyOnload" // Ensures script loads asynchronously
                                />
                        </head>
                        <body className={inter.className}>{children}</body>
                </html>
        );
}
