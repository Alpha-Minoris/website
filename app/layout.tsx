import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { DynamicBackground } from "@/components/layout/dynamic-background";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Alpha Minoris",
  description: "AI Tools and Strategy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn("min-h-screen bg-transparent font-sans antialiased", inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider>
          <DynamicBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
