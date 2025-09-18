'use client';

import { FormProvider } from '../context/FormContext';
import Header from './Header';
import Footer from './Footer';
import GoogleTagDebugger from './GoogleTagDebugger';
import GooglePlacesDebugger from './GooglePlacesDebugger';
import LazyGoogleMaps from './LazyGoogleMaps';
import LazyRecaptcha from './LazyRecaptcha';
import OptimizedGoogleTag from './OptimizedGoogleTag';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LazyGoogleMaps />
      <LazyRecaptcha />
      <OptimizedGoogleTag />
      
      <FormProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <GoogleTagDebugger />
        <GooglePlacesDebugger />
      </FormProvider>
    </>
  );
}