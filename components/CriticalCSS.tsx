'use client';

import { useEffect } from 'react';

const criticalCSS = `
  /* Critical above-the-fold CSS */
  *, ::before, ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
  }
  
  html {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  
  body {
    margin: 0;
    line-height: inherit;
  }
  
  main {
    display: block;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
  }
  
  p {
    margin: 0;
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: 100%;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    margin: 0;
    padding: 0;
  }
  
  /* Critical layout classes */
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    padding-right: 1rem;
    padding-left: 1rem;
  }
  
  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
    }
  }
  
  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
  
  /* Critical visibility utilities */
  .block { display: block; }
  .inline-block { display: inline-block; }
  .flex { display: flex; }
  .hidden { display: none; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .fixed { position: fixed; }
  
  /* Critical spacing */
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .mt-4 { margin-top: 1rem; }
  .mb-4 { margin-bottom: 1rem; }
  
  /* Critical colors */
  .bg-white { background-color: #ffffff; }
  .text-gray-900 { color: #111827; }
  .text-white { color: #ffffff; }
  
  /* Critical typography */
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
`;

export default function CriticalCSS() {
  useEffect(() => {
    // Load non-critical CSS after initial render
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = '/_next/static/css/app/layout.css';
    link.onload = function() {
      const linkElement = this as HTMLLinkElement;
      linkElement.onload = null;
      linkElement.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }, []);

  return (
    <style
      dangerouslySetInnerHTML={{ __html: criticalCSS }}
      data-critical="true"
    />
  );
}