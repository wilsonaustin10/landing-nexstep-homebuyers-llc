'use client';

import React, { useEffect } from 'react';
import { CheckCircle, Clock, Phone, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import Script from 'next/script';

export default function ThankYouPage() {

  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Track thank you page view
    trackEvent('thank_you_page_view');
    
    // Ensure gtag is available and track conversion
    const trackConversion = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        // Send page view event
        window.gtag('event', 'page_view', {
          page_path: '/thank-you',
          page_title: 'Thank You',
          page_location: window.location.href
        });
        
        // Track Google Ads conversion for successful form submission
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16906023932/Xl1jCN_Hz50bEPzntf0-',
          'value': 1.0,
          'currency': 'USD'
        });
        
        console.log('Conversion event sent to Google Ads');
      } else {
        // If gtag not available yet, try again
        setTimeout(trackConversion, 500);
      }
    };
    
    trackConversion();
  }, []);

  return (
    <>
      {/* Load Google Tag directly on thank-you page for immediate availability */}
      <Script
        id="google-tag-manager"
        src="https://www.googletagmanager.com/gtag/js?id=AW-16906023932"
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
            gtag('config', 'AW-16906023932', {
              page_path: '/thank-you',
              send_page_view: true
            });
            ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');` : ''}
          `,
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You! We've Received Your Information
          </h1>
          <p className="text-xl text-gray-600">
            One of our property specialists will contact you shortly with your cash offer
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Quick Response</h3>
                <p className="text-gray-600">
                  We'll review your property details and contact you immediately with a fair cash offer
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Personal Consultation</h3>
                <p className="text-gray-600">
                  We'll discuss your specific situation and answer any questions you have about the process
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Close On Your Timeline</h3>
                <p className="text-gray-600">
                  Once you accept our offer, we can close as quickly as 7 days or on your preferred timeline
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Need Immediate Assistance?</h3>
          <p className="text-gray-600 mb-4">
            Our team is available to help answer any questions
          </p>
          <a 
            href="tel:1234567890" 
            className="inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => trackEvent('thank_you_page_call_click')}
          >
            <Phone className="h-5 w-5" />
            <span>Call Us Now</span>
          </a>
        </div>
      </div>
    </main>
    </>
  );
} 