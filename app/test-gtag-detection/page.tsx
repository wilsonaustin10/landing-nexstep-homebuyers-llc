'use client';

import { useEffect, useState } from 'react';

export default function TestGtagDetection() {
  const [gtagStatus, setGtagStatus] = useState<string>('Checking...');
  const [dataLayerStatus, setDataLayerStatus] = useState<string>('Checking...');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const checkGtag = () => {
      // Check if gtag is available
      if (typeof window !== 'undefined' && window.gtag) {
        setGtagStatus('✅ gtag is loaded and available');
        
        // Test sending an event
        window.gtag('event', 'test_event', {
          event_category: 'test',
          event_label: 'gtag_detection_test',
          value: 1
        });
        
        console.log('gtag test event sent');
      } else {
        setGtagStatus('❌ gtag is not available');
        setTimeout(checkGtag, 1000); // Check again in 1 second
      }
      
      // Check dataLayer
      if (typeof window !== 'undefined' && window.dataLayer) {
        setDataLayerStatus(`✅ dataLayer exists with ${window.dataLayer.length} items`);
        setEvents(window.dataLayer.slice(-10)); // Show last 10 events
      } else {
        setDataLayerStatus('❌ dataLayer not found');
      }
    };
    
    checkGtag();
    
    // Also check after a delay
    const timeout = setTimeout(checkGtag, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Google Tag Detection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">gtag Status:</h2>
          <p className="font-mono">{gtagStatus}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">dataLayer Status:</h2>
          <p className="font-mono">{dataLayerStatus}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Recent dataLayer Events:</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Google Tag Assistant or browser developer tools</li>
            <li>Check if the Google Ads tag (AW-16906023932) is detected</li>
            <li>Navigate to <a href="/thank-you" className="text-blue-600 underline">/thank-you</a> page to test conversion tracking</li>
            <li>Check Tag Assistant for conversion event firing</li>
          </ol>
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={() => window.location.href = '/thank-you'}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Thank You Page
          </button>
          
          <button 
            onClick={() => {
              if (window.gtag) {
                window.gtag('event', 'manual_test_event', {
                  event_category: 'manual_test',
                  event_label: 'button_click'
                });
                alert('Test event sent! Check Tag Assistant.');
              } else {
                alert('gtag not available yet!');
              }
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Send Test Event
          </button>
        </div>
      </div>
    </main>
  );
}