'use client';

import { FormProvider } from '../context/FormContext';
import Header from './Header';
import Footer from './Footer';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load all non-critical components
const OptimizedGoogleMaps = dynamic(() => import('./OptimizedGoogleMaps'), {
  ssr: false,
  loading: () => null
});

const LazyRecaptcha = dynamic(() => import('./LazyRecaptcha'), {
  ssr: false,
  loading: () => null
});

// Removed OptimizedGoogleTagV2 - now using GoogleAnalytics in layout.tsx

const LazyDebuggers = dynamic(() => import('./LazyDebuggers'), {
  ssr: false,
  loading: () => null
});

export default function OptimizedClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FormProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        
        {/* Load third-party scripts after main content */}
        <Suspense fallback={null}>
          <OptimizedGoogleMaps />
          <LazyRecaptcha />
          <LazyDebuggers />
        </Suspense>
      </FormProvider>
    </>
  );
}