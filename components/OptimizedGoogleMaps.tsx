'use client';

import { useEffect, useRef } from 'react';
import { createGoogleMapsFacade } from '../utils/scriptLoader';

const googleMapsFacade = createGoogleMapsFacade();

export default function OptimizedGoogleMaps() {
  const hasInteracted = useRef(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Preload the script (adds link tag, doesn't execute)
    googleMapsFacade.preload();

    const handleUserInteraction = () => {
      if (!hasInteracted.current && !googleMapsFacade.isLoaded()) {
        hasInteracted.current = true;
        googleMapsFacade.load().then(() => {
          console.log('Google Maps loaded via user interaction');
          window.dispatchEvent(new Event('google-maps-ready'));
        }).catch(err => {
          console.error('Failed to load Google Maps:', err);
        });
      }
    };

    // Load on address input focus/click
    const addressInputs = document.querySelectorAll(
      'input[name="address"], input#address, [data-address-input]'
    );
    
    addressInputs.forEach(input => {
      input.addEventListener('focus', handleUserInteraction, { once: true });
      input.addEventListener('mouseenter', handleUserInteraction, { once: true });
    });

    // Load on form interaction (with slight delay to not block initial render)
    setTimeout(() => {
      const formInputs = document.querySelectorAll('input, select, textarea');
      formInputs.forEach(input => {
        input.addEventListener('focus', handleUserInteraction, { once: true });
      });
    }, 500);

    // Fallback: Load after 5 seconds if no interaction
    loadTimeoutRef.current = setTimeout(() => {
      if (!hasInteracted.current && !googleMapsFacade.isLoaded()) {
        hasInteracted.current = true;
        googleMapsFacade.load().then(() => {
          console.log('Google Maps loaded via timeout');
          window.dispatchEvent(new Event('google-maps-ready'));
        }).catch(err => {
          console.error('Failed to load Google Maps:', err);
        });
      }
    }, 5000);

    // Load on scroll past fold
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        if (!hasInteracted.current && !googleMapsFacade.isLoaded()) {
          hasInteracted.current = true;
          googleMapsFacade.load().then(() => {
            console.log('Google Maps loaded via scroll');
            window.dispatchEvent(new Event('google-maps-ready'));
          }).catch(err => {
            console.error('Failed to load Google Maps:', err);
          });
        }
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  return null;
}