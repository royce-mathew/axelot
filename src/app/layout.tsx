import type { Metadata } from "next";
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";


export const metadata: Metadata = {
  title: "Axelot",
  description: "A place to read, write, and deepen your understanding",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
