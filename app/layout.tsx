import { Inter } from 'next/font/google';
import './globals.css';
import OptimizedClientLayout from '../components/OptimizedClientLayout';
import Script from 'next/script';
import CriticalCSS from '../components/CriticalCSS';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Site Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="google-site-verification-code" />
        <CriticalCSS />
      </head>
      <body className={inter.className}>
        <OptimizedClientLayout>
          {children}
        </OptimizedClientLayout>
      </body>
    </html>
  );
} 