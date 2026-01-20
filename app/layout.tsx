import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { EditorToggle } from "@/components/editor/editor-toggle";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
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
  // PERFORMANCE FIX: Removed checkEditRights() call
  // This was forcing EVERY page to dynamic rendering because layout is shared
  // In production (process.env.NODE_ENV === 'production'), editor is never shown
  // On localhost, editor components are client-side and can detect environment themselves
  const canEdit = false  // Editor disabled in layout - pages handle their own auth

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn("min-h-screen bg-transparent font-sans antialiased", inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider>
          <DynamicBackground />
          {children}
          {canEdit && (
            <>
              <EditorToggle />
              <EditorSidebar />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
