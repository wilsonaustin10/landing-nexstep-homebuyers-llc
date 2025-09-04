'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestConversionPage() {
  const router = useRouter();
  const [conversionFired, setConversionFired] = useState(false);

  const testConversion = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Firing conversion with label: tFNHCNnqi48bEPzntf0-');
      window.gtag('event', 'conversion', {
        'send_to': 'AW-16906023932/tFNHCNnqi48bEPzntf0-',
        'value': 1.0,
        'currency': 'USD'
      });
      setConversionFired(true);
      
      // Also log to dataLayer for debugging
      if (window.dataLayer) {
        console.log('dataLayer content:', window.dataLayer);
      }
    } else {
      console.error('gtag not found on window object');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Conversion Tracking Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Conversion Tracking</h2>
          <p className="text-gray-600 mb-4">
            This page tests the Google Ads conversion tracking with the label: <code className="bg-gray-100 px-2 py-1 rounded">tFNHCNnqi48bEPzntf0-</code>
          </p>
          <p className="text-gray-600 mb-4">
            Account ID: <code className="bg-gray-100 px-2 py-1 rounded">AW-16906023932</code>
          </p>
          
          <div className="space-y-4">
            <button
              onClick={testConversion}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Fire Test Conversion
            </button>
            
            {conversionFired && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">✓ Conversion event fired! Check the Network tab in DevTools for the Google Ads request.</p>
              </div>
            )}
            
            <button
              onClick={() => router.push('/thank-you')}
              className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Go to Thank You Page (Real Conversion)
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to verify:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Open Chrome DevTools (F12)</li>
            <li>Go to the Network tab</li>
            <li>Filter by "conversion" or look for requests to googleads.g.doubleclick.net</li>
            <li>Click "Fire Test Conversion" and check if the request contains the correct label</li>
            <li>The request URL should include: /pagead/1p-conversion/16906023932/?...label=tFNHCNnqi48bEPzntf0-</li>
          </ol>
        </div>
      </div>
    </main>
  );
}