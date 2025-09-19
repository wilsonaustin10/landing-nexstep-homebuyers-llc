'use client';

import { useState, useEffect } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

export default function PerformanceDebugger() {
  const [metrics, setMetrics] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Check if user wants to see performance metrics
    const showDebugger = localStorage.getItem('showPerformanceDebugger') === 'true';
    setIsVisible(showDebugger);

    // Update metrics periodically
    const updateMetrics = () => {
      const perfMetrics = performanceMonitor.getMetrics();
      
      // Add resource timing info
      if (window.performance) {
        const resources = window.performance.getEntriesByType('resource');
        const scriptMetrics: any = {};
        
        resources.forEach(r => {
          if (r.name.includes('maps.googleapis.com')) {
            scriptMetrics.googleMaps = {
              start: r.startTime.toFixed(0),
              duration: r.duration.toFixed(0)
            };
          }
          if (r.name.includes('googletagmanager.com')) {
            scriptMetrics.googleTag = {
              start: r.startTime.toFixed(0),
              duration: r.duration.toFixed(0)
            };
          }
        });

        setMetrics({
          ...perfMetrics,
          scripts: scriptMetrics
        });
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-green-400 p-3 rounded-lg font-mono text-xs max-w-md z-50">
      <div className="mb-2 text-white font-bold">Performance Metrics</div>
      
      {metrics.firstContentfulPaint && (
        <div>FCP: {metrics.firstContentfulPaint.toFixed(0)}ms</div>
      )}
      {metrics.largestContentfulPaint && (
        <div>LCP: {metrics.largestContentfulPaint.toFixed(0)}ms</div>
      )}
      
      {metrics.scripts?.googleMaps && (
        <div className="mt-2">
          <div className="text-yellow-300">Google Maps:</div>
          <div>Start: {metrics.scripts.googleMaps.start}ms</div>
          <div>Duration: {metrics.scripts.googleMaps.duration}ms</div>
        </div>
      )}
      
      {metrics.scripts?.googleTag && (
        <div className="mt-2">
          <div className="text-yellow-300">Google Tag:</div>
          <div>Start: {metrics.scripts.googleTag.start}ms</div>
          <div>Duration: {metrics.scripts.googleTag.duration}ms</div>
        </div>
      )}
      
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('showPerformanceDebugger', 'false');
        }}
        className="mt-2 text-xs text-gray-400 hover:text-white"
      >
        Hide (set showPerformanceDebugger in localStorage to show again)
      </button>
    </div>
  );
}