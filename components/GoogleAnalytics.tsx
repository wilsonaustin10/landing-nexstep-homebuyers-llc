'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADS_CONVERSION_ID = 'AW-16906023932';

function GoogleAnalyticsInner() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && window.gtag) {
      // Track page view
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_CONVERSION_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            
            // Google Ads configuration
            gtag('config', '${ADS_CONVERSION_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            
            // Google Analytics configuration (if available)
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname
            });` : ''}
          `,
        }}
      />
    </>
  );
}

export default function GoogleAnalytics() {
  return <GoogleAnalyticsInner />;
}