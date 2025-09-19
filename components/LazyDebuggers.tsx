'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load debug components only in development
const GoogleTagDebugger = dynamic(() => import('./GoogleTagDebugger'), {
  ssr: false,
  loading: () => null,
});

const GooglePlacesDebugger = dynamic(() => import('./GooglePlacesDebugger'), {
  ssr: false,
  loading: () => null,
});

const PerformanceDebugger = dynamic(() => import('./PerformanceDebugger'), {
  ssr: false,
  loading: () => null,
});

export default function LazyDebuggers() {
  const [showDebuggers, setShowDebuggers] = useState(false);

  useEffect(() => {
    // Only load debuggers in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || 
        localStorage.getItem('enableDebuggers') === 'true') {
      setShowDebuggers(true);
    }
  }, []);

  if (!showDebuggers) {
    return null;
  }

  return (
    <>
      <GoogleTagDebugger />
      <GooglePlacesDebugger />
      <PerformanceDebugger />
    </>
  );
}