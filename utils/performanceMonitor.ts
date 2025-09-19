export interface PerformanceMetrics {
  scriptLoadTime?: number;
  timeToInteractive?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private scriptLoadStart: Map<string, number> = new Map();

  markScriptLoadStart(scriptName: string) {
    this.scriptLoadStart.set(scriptName, performance.now());
  }

  markScriptLoadEnd(scriptName: string) {
    const startTime = this.scriptLoadStart.get(scriptName);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      console.log(`[Performance] ${scriptName} loaded in ${loadTime.toFixed(2)}ms`);
      this.scriptLoadStart.delete(scriptName);
      return loadTime;
    }
    return null;
  }

  logWebVitals() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe FCP
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
              console.log('[Performance] FCP:', entry.startTime.toFixed(2) + 'ms');
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Could not observe FCP:', e);
      }

      // Observe LCP
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2) + 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('Could not observe LCP:', e);
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if scripts are truly deferred
  checkScriptLoadTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = window.performance.getEntriesByType('resource');
      const scripts = resources.filter(r => r.name.includes('.js'));
      
      scripts.forEach(script => {
        if (script.name.includes('maps.googleapis.com') || 
            script.name.includes('googletagmanager.com')) {
          console.log(`[Performance] ${script.name.split('/').pop()}: 
            Start: ${script.startTime.toFixed(0)}ms, 
            Duration: ${script.duration.toFixed(0)}ms`);
        }
      });
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  performanceMonitor.logWebVitals();
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.checkScriptLoadTiming();
    }, 100);
  });
}

export default performanceMonitor;