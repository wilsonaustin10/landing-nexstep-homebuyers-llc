'use client';

import Script from 'next/script';

export default function OptimizedGoogleTag() {
  return (
    <>
      {/* Load Google Tag Manager with afterInteractive strategy */}
      <Script
        id="google-tag-manager"
        src="https://www.googletagmanager.com/gtag/js?id=AW-16906023932"
        strategy="afterInteractive"
      />
      <Script
        id="google-tag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', 'AW-16906023932');
            
            ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');` : ''}
            
            window.gtag_report_conversion = function(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion', {
                'send_to': 'AW-16906023932/phone_conversion',
                'value': 1.0,
                'currency': 'USD',
                'event_callback': callback
              });
              return false;
            }
          `,
        }}
      />
    </>
  );
}