import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MintPraMim - Connect with Similar Interests',
  description: 'Find and connect with people who share your interests',
  manifest: '/manifest.json',
  themeColor: '#8a70d6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MintPraMim'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mintpramim.com',
    title: 'MintPraMim - Connect with Similar Interests',
    description: 'Find and connect with people who share your interests',
    siteName: 'MintPraMim',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-20 blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-10 blur-3xl -z-10 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Subtle grid pattern */}
            <div className="fixed inset-0 bg-grid-pattern opacity-5 -z-10"></div>
            
            {/* Small decorative elements */}
            <div className="fixed top-20 left-10 w-3 h-3 bg-purple-400 rounded-full opacity-30 -z-10"></div>
            <div className="fixed top-40 right-20 w-2 h-2 bg-blue-400 rounded-full opacity-30 -z-10"></div>
            <div className="fixed bottom-30 left-30 w-4 h-4 bg-green-300 rounded-full opacity-30 -z-10"></div>
            
            {children}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
