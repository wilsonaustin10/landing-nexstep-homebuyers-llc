'use client';

import { FormProvider } from '../context/FormContext';
import Header from './Header';
import Footer from './Footer';
import OptimizedGoogleMaps from './OptimizedGoogleMaps';
import LazyRecaptcha from './LazyRecaptcha';
import OptimizedGoogleTagV2 from './OptimizedGoogleTagV2';
import LazyDebuggers from './LazyDebuggers';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OptimizedGoogleMaps />
      <LazyRecaptcha />
      <OptimizedGoogleTagV2 />
      
      <FormProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <LazyDebuggers />
      </FormProvider>
    </>
  );
}