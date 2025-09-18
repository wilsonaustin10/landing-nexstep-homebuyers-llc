'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function LazyRecaptcha() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true);
    };

    // Load ReCaptcha when user starts interacting with form
    const formElements = document.querySelectorAll('input, button, select, textarea');
    
    formElements.forEach(element => {
      element.addEventListener('focus', handleInteraction, { once: true });
      element.addEventListener('click', handleInteraction, { once: true });
    });

    // Also load on scroll past a certain point
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShouldLoad(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Load after 5 seconds as fallback
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (!shouldLoad || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      strategy="lazyOnload"
      onLoad={() => {
        console.log('ReCaptcha loaded successfully');
      }}
    />
  );
}