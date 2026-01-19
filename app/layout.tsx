import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { EditorToggle } from "@/components/editor/editor-toggle";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { checkEditRights } from "@/lib/auth-utils";

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
  const canEdit = await checkEditRights()

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider>
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
