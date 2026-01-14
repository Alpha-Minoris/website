import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { EditorToggle } from "@/components/editor/editor-toggle";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { TextToolbar } from '@/components/editor/text-toolbar';

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Alpha Minoris",
  description: "AI Tools and Strategy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider>
          {children}
          <EditorToggle />
          <EditorSidebar />
          <TextToolbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
