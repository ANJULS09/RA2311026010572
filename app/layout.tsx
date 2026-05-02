import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../utils/theme';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Notifications",
  description: "Campus Notification System with Priority Inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            <main style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
              {children}
            </main>
          </ThemeProvider>
      </body>
    </html>
  );
}
