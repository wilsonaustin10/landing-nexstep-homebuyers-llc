'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface LazyGoogleMapsProps {
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export default function LazyGoogleMaps({ onLoad, onError }: LazyGoogleMapsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check if user is interacting with address-related elements
    const handleInteraction = () => {
      setShouldLoad(true);
    };

    // Load on first user interaction with the form
    const addressInputs = document.querySelectorAll('[name="address"], #address');
    const formElements = document.querySelectorAll('input, button, select, textarea');
    
    // Add listeners to address-specific inputs
    addressInputs.forEach(element => {
      element.addEventListener('focus', handleInteraction, { once: true });
      element.addEventListener('click', handleInteraction, { once: true });
    });

    // Also load on any form interaction after a delay
    const loadTimer = setTimeout(() => {
      formElements.forEach(element => {
        element.addEventListener('focus', handleInteraction, { once: true });
        element.addEventListener('click', handleInteraction, { once: true });
      });
    }, 100);

    // Load after 3 seconds if no interaction
    const fallbackTimer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Google Maps script loaded successfully');
          if (typeof window !== 'undefined') {
            (window as any).googleMapsLoaded = true;
          }
          onLoad?.();
        }}
        onError={(e) => {
          console.error('Error loading Google Maps script:', e);
          onError?.(e);
        }}
      />
      <Script id="google-maps-init" strategy="lazyOnload">
        {`
          function initMap() {
            console.log('Google Maps initialized');
            if (typeof window !== 'undefined') {
              window.googleMapsReady = true;
              window.dispatchEvent(new Event('google-maps-ready'));
            }
          }
          if (typeof window !== 'undefined') {
            window.initMap = initMap;
          }
        `}
      </Script>
    </>
  );
}