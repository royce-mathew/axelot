import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import "@/styles/globals.css";

import { CssBaseline } from "@mui/material";


export const metadata: Metadata = {
  title: "Medium - Where good ideas find you",
  description: "A place to read, write, and deepen your understanding",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider  options={{  enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
