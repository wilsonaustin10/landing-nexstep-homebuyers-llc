'use client';

import { useEffect, useRef } from 'react';
import { createGoogleTagFacade } from '../utils/scriptLoader';

const googleTagFacade = createGoogleTagFacade();

export default function OptimizedGoogleTagV2() {
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Preload the script
    googleTagFacade.preload();

    // Set up a minimal gtag stub that queues events
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      window.dataLayer = window.dataLayer || [];
      (window as any).gtag = function(...args: any[]) {
        // Queue events until real gtag loads
        googleTagFacade.trackEvent(args[1], args[2]);
      };
    }

    const loadGoogleTag = () => {
      if (!hasLoaded.current && !googleTagFacade.isLoaded()) {
        hasLoaded.current = true;
        googleTagFacade.load().then(() => {
          console.log('Google Tag Manager loaded');
        }).catch(err => {
          console.error('Failed to load Google Tag Manager:', err);
        });
      }
    };

    // Load on important user interactions
    const handleImportantInteraction = () => {
      loadGoogleTag();
    };

    // Track form submissions and important buttons
    const importantElements = document.querySelectorAll(
      'form, button[type="submit"], a[href^="tel:"], .cta-button, [data-conversion]'
    );

    importantElements.forEach(element => {
      element.addEventListener('click', handleImportantInteraction, { once: true });
      element.addEventListener('submit', handleImportantInteraction, { once: true });
    });

    // Load on any form interaction after a delay
    setTimeout(() => {
      const formElements = document.querySelectorAll('input, select, textarea, button');
      formElements.forEach(element => {
        element.addEventListener('focus', handleImportantInteraction, { once: true });
      });
    }, 1000);

    // Load after 10 seconds as fallback (longer delay since it's less critical)
    const fallbackTimer = setTimeout(() => {
      loadGoogleTag();
    }, 10000);

    // Load when user scrolls significantly
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        loadGoogleTag();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return null;
}